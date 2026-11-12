import { splitRouteState } from "./route-state.mjs";
import { splitLaunchState } from "./launch-state.mjs";
import { splitHostCommands } from "./host-commands.mjs";
import { partition } from "./partition.mjs";
import { destinations } from "./destinations.mjs";
import { bootstrapNavigation } from "./navigation-bootstrap.js";
import assert from "node:assert/strict";
import { extractTransaction } from "./transaction.mjs";
import { splitRuntime } from "./split-runtime.mjs";
import path from "node:path";
import { cp, readFile, rm, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { parseSync, transformFromAstSync } from "@babel/core";
import { gzipSync } from "node:zlib";
const root = path.resolve(import.meta.dirname, "../..");
const input = path.resolve(process.argv[2] ?? path.join(root, ".cache/fumadocs/exact/dist"));
const out = path.resolve(process.argv[3] ?? path.join(root, ".cache/local-activation/dist"));
assert.notEqual(input, out);
assert.ok(
  process.env.LOCAL_DESTINATION !== "1" || process.env.LOCAL_PARTITION === "1",
  "Destination mode requires the shared resource-owner partition",
);
assert.ok(
  out.startsWith(path.join(root, ".cache/local-activation") + path.sep),
  "Prototype output must stay under .cache/local-activation",
);
assert.ok(process.env.EXACT_ROOT, "Set EXACT_ROOT to an initialized expo/exact checkout");
const requireSDK = createRequire(path.join(process.env.EXACT_ROOT, "package.json"));
const { rolldown } = await import(requireSDK.resolve("rolldown"));
const { asyncContext } = await import(
  path.join(process.env.EXACT_ROOT, "js/bake/src/typescript.mjs")
);
const parse = (code) =>
  parseSync(code, { sourceType: "module", configFile: false, babelrc: false });
const code = (node) =>
  transformFromAstSync(
    node.type === "File"
      ? node
      : { type: "File", program: { type: "Program", sourceType: "module", body: [node] } },
    "",
    { configFile: false, babelrc: false, compact: true },
  ).code;
const source = await Bun.file(path.join(input, ".gen/app.js")).text();
const ast = parse(source),
  declaration = ast.program.body.find((n) => n.type === "ExportDefaultDeclaration");
const body = declaration.declaration.body.body;
const isCall = (n, name) =>
  n.type === "ExpressionStatement" &&
  n.expression.type === "CallExpression" &&
  n.expression.callee.name === name;
const mountAt = body.findIndex((n) => isCall(n, "mount"));
assert.ok(mountAt > 0, "Expected native JS compiler root factory and mount boundary");
if (process.env.LOCAL_PARTITION === "1")
  for (const statement of body) {
    const allowed =
      statement.type === "VariableDeclaration" ||
      statement.type === "ReturnStatement" ||
      ["routes", "usePaint", "mount", "router"].some((name) => isCall(statement, name));
    assert.ok(
      allowed,
      "This optimization does not qualify additional root effects, timers or lifecycle hooks",
    );
  }
const mount = body[mountAt],
  router = body.find((n) => isCall(n, "router"));
assert.ok(router, "Expected one router owner");
const state = body.find(
  (n) => n.type === "VariableDeclaration" && n.declarations.some((d) => d.id.name === "$state"),
);
assert.ok(state);
// A bounded prototype: unsupported roots are refused rather than silently losing tasks or child state.
const namesSource = await Bun.file(path.join(input, ".gen/names.js")).text();
const names = parse(namesSource).program.body.find(
  (n) => n.type === "ExportDefaultDeclaration",
).declaration;
const namesValue = JSON.parse(
  code({ type: "ExpressionStatement", expression: names }).slice(0, -1),
);
const hasCounter = namesValue[0].includes("comparisonCount");
assert.deepEqual(namesValue[0], [
  "docsNav",
  "docsQuery",
  ...(hasCounter ? ["comparisonCount"] : []),
]);
assert.equal(namesValue.length, 3);
assert.deepEqual(namesValue[1], [
  "docsPage",
  "docsPath",
  "docsLocale",
  "docsVersion",
  "docsPageId",
  "docsResults",
]);
assert.deepEqual(namesValue[2], ["docsRouteReply", "docsContent", "docsSearchReply"]);
assert.ok(
  !body.some((n) => /useSchedule|queues|mutation/.test(code(n))),
  "Task/mutation roots need an explicit activation gate; unsupported in this probe",
);
const declarations = body
  .filter((n) => n.type === "VariableDeclaration" && n !== state)
  .flatMap((n) => n.declarations.map((d) => d.id.name));
assert.ok(declarations.every(Boolean));
const counterMatch = source.match(
  /const (e\d+)=h\([^;]*"data-testid":"comparison-counter"[^;]*;on\(\1,"press",(a_\d+),onPress\);const (e\d+)=h\(\1,[^;]*;P\(\3,"text",([^;]+)\);/,
);
assert.equal(
  Boolean(counterMatch),
  hasCounter,
  "Only the qualified optional counter binding is supported",
);
const [, counterElement, counterAction, counterText, counterExpression] = counterMatch ?? [];
const inputMatch = source.match(/on\((e\d+),"input",(a_\d+),onValue\)/);
assert.ok(inputMatch, "Search must expose a native compiler onValue action");
assert.ok(
  declarations.includes(inputMatch[2]),
  "Only a root-owned compiled search action is qualified",
);
const rootBefore = body.slice(0, mountAt).filter((n) => !isCall(n, "usePaint"));
const rootAst = structuredClone(ast);
rootAst.program.body = rootAst.program.body.filter((n) => n.type !== "ExportDefaultDeclaration");
rootAst.program.body.push(
  ...parse(
    `export default function initialize(){${rootBefore.map(code).join("")}${code(state)}return {${declarations.join(",")},$state};}`,
  ).program.body,
);
const viewAst = structuredClone(ast);
viewAst.program.body = viewAst.program.body.filter((n) => n.type !== "ExportDefaultDeclaration");
viewAst.program.body.unshift(
  parse("import {installHostCommands} from './host-commands.js';").program.body[0],
);
const paint = body.filter((n) => isCall(n, "usePaint"));
viewAst.program.body.push(
  ...parse(
    `export default function activate(env){installHostCommands();const {${declarations.join(",")}}=env;${paint.map(code).join("")}${code(mount)}${code(router)}}`,
  ).program.body,
);
await rm(out, { recursive: true, force: true });
await cp(input, out, { recursive: true });
const gen = path.join(out, ".gen");
// The deferred native root adopts the exact same pre-existing slot and action, not copied values.
const sharedImport = parse("import {shared} from './local-shared.js';").program.body[0];
rootAst.program.body.unshift(sharedImport);
const rootFunction = rootAst.program.body.find(
  (n) => n.type === "ExportDefaultDeclaration",
).declaration;
for (const statement of rootFunction.body.body)
  if (statement.type === "VariableDeclaration")
    for (const d of statement.declarations) {
      if (hasCounter && (d.id.name === "s_2" || d.id.name === counterAction))
        d.init = parse(`shared.${d.id.name}`).program.body[0].expression;
      if (d.id.name === "$state") d.init = parse("shared.state").program.body[0].expression;
    }
const resultAt = rootFunction.body.body.findIndex((n) => n.type === "ReturnStatement");
rootFunction.body.body.splice(
  resultAt,
  0,
  ...parse(
    state.declarations[0].init.elements
      .map(
        (element, index) =>
          `Object.assign($state[${index}],${code({ type: "ExpressionStatement", expression: element }).slice(0, -1)});`,
      )
      .join(""),
  ).program.body,
);
await Bun.write(path.join(gen, "local-shared.js"), "export const shared={state:[[],[],[]]};");
await splitRuntime(gen);
if (process.env.LOCAL_RESOURCE_SPLIT !== "0") await extractTransaction(gen);
await splitHostCommands(gen);
if (process.env.LOCAL_PARTITION === "1") {
  await partition(gen);
  if (process.env.LOCAL_LAUNCH_SPLIT !== "0") {
    await splitLaunchState(gen);
    await splitRouteState(gen);
  }
}
if (process.env.LOCAL_PARTITION === "1")
  transformFromAstSync(rootAst, "", {
    configFile: false,
    babelrc: false,
    cloneInputAst: false,
    plugins: [
      () => ({
        visitor: {
          Program(p) {
            for (const row of p.get("body"))
              if (row.isImportDeclaration()) {
                for (const spec of row.get("specifiers"))
                  if (!p.scope.getBinding(spec.node.local.name)?.referenced) spec.remove();
                if (!row.node.specifiers.length) row.remove();
              }
          },
        },
      }),
    ],
  });
if (process.env.LOCAL_DESTINATION === "1") {
  await destinations(gen, input);
  await Bun.write(
    path.join(gen, "destination-runtime.js"),
    await readFile(new URL("./destination-runtime.js", import.meta.url), "utf8"),
  );
}
await Bun.write(path.join(gen, "local-root.js"), code(rootAst));
if (process.env.LOCAL_PARTITION === "1") {
  viewAst.program.body.unshift(
    parse("import {installFullRuntime} from './unit-full-setup.js';").program.body[0],
  );
  viewAst.program.body
    .find((n) => n.type === "ExportDefaultDeclaration")
    .declaration.body.body.unshift(parse("installFullRuntime();").program.body[0]);
}
if (process.env.LOCAL_PARTITION === "1") {
  await Bun.write(
    path.join(gen, "full-data.js"),
    "import{data}from './rt.js';import{install}from './ts-data.js';import{answering}from './ts-fetch.js';import{heldReply,looseFetch}from './held.js';export function installFullData(){install(data,false);Object.assign(answering,{loose:looseFetch,heldReply});}",
  );
  viewAst.program.body.unshift(
    parse("import {installFullData} from './full-data.js';").program.body[0],
  );
  const activation = viewAst.program.body.find(
    (n) => n.type === "ExportDefaultDeclaration",
  ).declaration;
  activation.body.body.splice(1, 0, parse("installFullData();").program.body[0]);
}
await Bun.write(path.join(gen, "local-view.js"), code(viewAst));
let runtime = await readFile(new URL("./runtime.js", import.meta.url), "utf8");
if (process.env.LOCAL_PARTITION === "1")
  runtime = runtime
    .replace("P,\n  onPress,\n  onValue,", "")
    .replace(
      'P(counter.querySelector("[data-exact-text]") ?? counter, "text", () => text(counter));',
      'effect(()=>{(counter.querySelector("[data-exact-text]")??counter).textContent=text(counter);});',
    )
    .replace(
      'onPress(counter, "press", counterAction, listen(counter));',
      'listen(counter)("click",()=>counterAction());',
    )
    .replace(
      'onValue(input, "input", searchAction, listen(input));',
      'listen(input)("input",event=>searchAction(event instanceof CustomEvent?event.detail:input.value));',
    );
if (process.env.LOCAL_DESTINATION === "1") {
  runtime =
    "import {destinationHost} from './destination-runtime.js';import {loads} from './destination-loads.js';\n" +
    runtime;
  runtime = runtime.replace(
    "  let promotion;",
    "  let promotion;\n  const destination=destinationHost({env,commit,W,effect,scope,end,loads,full:promote,styles:loadStyles});",
  );
  runtime = runtime.replace("  env,", "  env, W,");
  runtime = runtime.replace(
    "      for (const stop of cleanup) stop();",
    "      destination.dispose();\n      for (const stop of cleanup) stop();",
  );
  runtime = runtime.replace(
    "promote()\n      .then(() => env.a_1(url.pathname + url.search + url.hash))",
    "destination.follow(url.href)",
  );
  assert.match(runtime, /function copyPage\(\)\s*\{[\s\S]*?\}/);
  runtime = runtime.replace(
    /function copyPage\(\)\s*\{[\s\S]*?\}/,
    "function copyPage(){return destination.copy();}",
  );
  runtime = runtime.replace(
    "follow: (url) => promote().then(() => env.a_1(url))",
    "follow: (url) => destination.follow(url)",
  );
}
await Bun.write(path.join(gen, "local-runtime.js"), runtime);
const counterSlot = body.find(
  (n) => n.type === "VariableDeclaration" && n.declarations.some((d) => d.id.name === "s_2"),
);
const counterDeclaration = body.find(
  (n) =>
    n.type === "VariableDeclaration" && n.declarations.some((d) => d.id.name === counterAction),
);
if (hasCounter)
  assert.equal(
    code(counterSlot),
    'const s_2=sig(0,"n");',
    "Only an isolated numeric counter slot is qualified",
  );
if (hasCounter)
  assert.equal(
    code(counterDeclaration),
    "const a_2=act(()=>{W(s_2,s_2()+1);});",
    "Only the qualified pure counter action may activate early",
  );
const main = `import {sig,act,W,commit,effect,scope,end}from './reactive-core.js';import{shared}from './local-shared.js';
import{tg,cc}from './budget.js';import{x_toString}from './roster.js';
import{activateCounter}from './counter-runtime.js';
${hasCounter ? `${code(counterSlot)}${code(counterDeclaration)}shared.s_2=s_2;shared.${counterAction}=${counterAction};shared.state[0][2]=s_2;` : ""}
activateCounter({shared,commit,effect,scope,end,action:${counterAction ?? "undefined"},text:${hasCounter ? `e=>{const ${counterText}=e;return (${counterExpression})();}` : "()=>''"},search:()=>import('./local-main-search.js')});`;
let searchMain = `import initialize from './local-root.js';
import {journal,data,commit,effect,scope,end,P,onPress,onValue,clock} from './rt.js';
import {install} from './ts-data.js';
import {answering} from './ts-fetch.js';import {heldReply,looseFetch}from './held.js';
import {tg,cc} from './budget.js';import {x_toString}from './rt.js';
import {activateLocal}from './local-runtime.js';
globalThis.exact.journal=journal;install(data,false);Object.assign(answering,{loose:looseFetch,heldReply});
globalThis.exact.rootInitializations=(globalThis.exact.rootInitializations??0)+1;const checkpointNode=document.querySelector('script[type="application/vnd.exact.checkpoint"][data-src]');
if(checkpointNode)checkpointNode.textContent=(await (globalThis.exact.answers??fetch(checkpointNode.dataset.src).then(response=>{if(!response.ok)throw Error('Checkpoint unavailable');return response.text();})))??'{"time":0,"answers":[]}';
let env; if(commit(()=>{env=initialize()},'local root boot')!==true)throw Error('Local root refused');
const text=${hasCounter ? `e=>{const ${counterText}=e;const {${declarations.join(",")}}=env;return (${counterExpression})();}` : "()=>''"};
export default function start(options){return activateLocal({env,commit,effect,scope,end,P,onPress,onValue,clock,text,counterAction:${hasCounter ? `env.${counterAction}` : "undefined"},searchAction:env.${inputMatch[2]},view:()=>import('./local-view.js'),...options});}`;
if (process.env.LOCAL_PARTITION === "1")
  searchMain = searchMain
    .replace("P,onPress,onValue,", "")
    .replace("scope,end,P,onPress,onValue,clock,text", "scope,end,clock,text")
    .replace("from './ts-data.js'", "from './pure-data.js'")
    .replace(
      "import {answering} from './ts-fetch.js';import {heldReply,looseFetch}from './held.js';",
      "",
    )
    .replace("Object.assign(answering,{loose:looseFetch,heldReply});", "")
    .replace("journal,data,commit", "journal,data,W,commit")
    .replace(
      "globalThis.exact.journal=journal;",
      "globalThis.exact.journal=journal;globalThis.exact.resourceProbe={data,commit,W};",
    );
await Bun.write(
  path.join(gen, "counter-runtime.js"),
  await readFile(new URL("./counter-runtime.js", import.meta.url), "utf8"),
);
if (process.env.LOCAL_DESTINATION === "1")
  searchMain = searchMain.replace("activateLocal({env,commit", "activateLocal({env,W,commit");
await Bun.write(path.join(gen, "local-main-search.js"), searchMain);
await Bun.write(path.join(gen, "local-main.js"), main);
const b = await rolldown({
  input: path.join(gen, "local-main.js"),
  transform: { define: { "globalThis.__exactRender": "false" } },
  plugins: [
    {
      name: "relocated-checked-capture",
      async load(id) {
        if (
          process.env.LOCAL_PARTITION === "1" &&
          ((path.basename(id).startsWith("unit-") &&
            !["unit-setup.js", "unit-full-setup.js"].includes(path.basename(id))) ||
            (process.env.LOCAL_LAUNCH_SPLIT !== "0" &&
              ["navigation.js", "router.js", "document.js", "live-time.js"].some(
                (name) => id === path.join(gen, name),
              )))
        )
          return { code: await Bun.file(id).text(), moduleSideEffects: false };
      },
      resolveId(id) {
        const marker = "/.gen/typescript/";
        const i = id.indexOf(marker);
        return i < 0 ? null : path.join(gen, "typescript", id.slice(i + marker.length));
      },
    },
    asyncContext(),
  ],
  logLevel: "warn",
});
let bundle;
try {
  bundle = await b.write({
    dir: out,
    format: "esm",
    minify: true,
    comments: false,
    entryFileNames: "app.js",
    chunkFileNames: "[name]-[hash].js",
    postBanner: (chunk) => (chunk.isEntry ? "//# allFunctionsCalledOnLoad" : undefined),
  });
} finally {
  await b.close();
}
const searchChunk = bundle.output.find(
  (chunk) => chunk.type === "chunk" && chunk.facadeModuleId?.endsWith("/local-main-search.js"),
);
assert.ok(searchChunk, "Missing search activation chunk");
const chunks = new Map(
  bundle.output.filter((chunk) => chunk.type === "chunk").map((chunk) => [chunk.fileName, chunk]),
);
const counterClosure = new Set();
function visitCounter(name) {
  if (counterClosure.has(name)) return;
  counterClosure.add(name);
  for (const dependency of chunks.get(name)?.imports ?? []) visitCounter(dependency);
}
visitCounter("app.js");
const preloads = new Set();
function visit(name) {
  if (preloads.has(name)) return;
  preloads.add(name);
  for (const dependency of chunks.get(name)?.imports ?? []) visit(dependency);
}
visit(searchChunk.fileName);
const searchClosure = [...preloads];
if (process.env.LOCAL_PARTITION === "1" && process.env.LOCAL_LAUNCH_SPLIT !== "0")
  for (const name of searchClosure)
    assert.ok(
      !Object.keys(chunks.get(name).modules).some((id) =>
        ["navigation.js", "document.js", "live-time.js", "router.js"].some(
          (file) => id === path.join(gen, file),
        ),
      ),
      "Browser projection must not re-enter the resource-owner closure",
    );
const hostCommandChunks = bundle.output
  .filter(
    (chunk) =>
      chunk.type === "chunk" &&
      Object.keys(chunk.modules).some((id) => id.endsWith("/host-commands.js")),
  )
  .map((chunk) => chunk.fileName);
assert.ok(hostCommandChunks.length > 0);
assert.ok(
  hostCommandChunks.every((name) => !searchClosure.includes(name)),
  "Host command implementation must stay outside the static search closure",
);
const viewChunk = bundle.output.find(
  (chunk) => chunk.type === "chunk" && chunk.facadeModuleId?.endsWith("/local-view.js"),
);
assert.ok(viewChunk);
if (process.env.LOCAL_RESOURCE_SPLIT !== "0" && process.env.LOCAL_DESTINATION !== "1")
  visit(viewChunk.fileName);
// Match the approved render-preload policy: download dependencies early without executing the root.
const destinationTargets = {};
if (process.env.LOCAL_DESTINATION === "1") {
  const appSource = await Bun.file(path.join(gen, "typescript/app.ts")).text();
  for (const [, url, body] of appSource.matchAll(
    /\["([^"]+)", \(\) => import\("\.\/docs-content\/(body-\d+\.ts)"\)/g,
  )) {
    const chunk = bundle.output.find(
      (row) =>
        row.type === "chunk" &&
        row.facadeModuleId === path.join(gen, "typescript/docs-content", body),
    );
    assert.ok(chunk, `Missing target chunk for ${url}`);
    destinationTargets[url] = "./" + chunk.fileName;
  }
}
let hintedPages = 0;
async function hint(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== ".gen") await hint(file);
    } else if (entry.name.endsWith(".html")) {
      let html = await Bun.file(file).text();
      if (process.env.LOCAL_DESTINATION === "1") {
        const visible = new Set(
          [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map((row) => row[1].split(/[?#]/)[0]),
        );
        const targets = Object.fromEntries(
          Object.entries(destinationTargets).filter(([url]) => visible.has(url)),
        );
        html = html.replace(
          /(<base\b[^>]*>)/,
          `$1<script>(${bootstrapNavigation.toString()})(${JSON.stringify(targets)},${JSON.stringify(searchClosure.map((name) => "./" + name))})</script>`,
        );
      }
      if (!html.includes("application/vnd.exact.checkpoint")) continue;
      if (process.env.LOCAL_PARTITION === "1") {
        html = html.replace(
          'href="./app.js" fetchpriority="low">',
          'href="./app.js" fetchpriority="high">',
        );
      }
      assert.ok(
        html.includes('rel="modulepreload" href="./app.js"'),
        "This probe requires render preloading",
      );
      const priority = process.env.LOCAL_PARTITION === "1" ? "high" : "low";
      const anchor = `href="./app.js" fetchpriority="${priority}">`;
      const hints = [...new Set([...preloads, ...counterClosure])]
        .filter((name) => name !== "app.js")
        .map(
          (name) =>
            `<link rel="modulepreload" href="./${name}" fetchpriority="${process.env.LOCAL_PARTITION === "1" && counterClosure.has(name) ? "high" : "low"}">`,
        )
        .join("");
      await Bun.write(file, html.replace(anchor, anchor + hints));
      hintedPages++;
    }
  }
}
if (process.env.LOCAL_SEARCH_PRELOAD !== "0") await hint(out);
const bytes = await Bun.file(path.join(out, "app.js")).bytes();
const result = {
  input,
  out,
  compilerBoundary: "root factory / mount",
  rootSlots: namesValue[0],
  resources: namesValue[2],
  entry: { raw: bytes.length, gzip: gzipSync(bytes).length },
  searchPreloads: [...preloads],
  searchClosure,
  counterClosure: [...counterClosure],
  destinationTargets,
  searchModules: Object.fromEntries(
    searchClosure.map((name) => [
      name,
      Object.keys(chunks.get(name).modules).map((id) => path.relative(gen, id)),
    ]),
  ),
  hostCommandChunks,
  hintedPages,
  counter: hasCounter
    ? { element: counterElement, action: counterAction, text: counterExpression }
    : null,
  searchAction: inputMatch[2],
};
await Bun.write(path.join(out, "local-activation.json"), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
