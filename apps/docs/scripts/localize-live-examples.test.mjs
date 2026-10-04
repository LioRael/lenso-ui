import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parse } from "@babel/parser";
import generateModule from "@babel/generator";
import {
  localizeModule,
  localizeComposition,
  reachableAdaptation,
  generateLocalizedExamples,
  authoredLocaleModifications,
} from "./localize-live-examples.mjs";
import {
  sourcePins,
  implementationPins,
  outputPins,
  verifySourceCapture,
  verifyDisclosureInputs,
  verifyDisclosureOutput,
  verifyDisclosureProvenance,
} from "./capture-disclosure-source.mjs";

// A Lenso-added accessible name has no paired upstream literal and must not be falsely credited to it.
test("localizes the authored Status name without weakening reviewed composition pins", async (t) => {
  const original = 'export function Basic() { return <input name="status" />; }';
  const adapted = 'export function Basic() { return <input name="status" aria-label="Status" />; }';
  const modified = authoredLocaleModifications("en/input-group/with-loading-suffix.tsx", adapted);
  assert.match(modified.code, /aria-label="状态"/);
  assert.match(modified.code, /name="status"/);
  assert.equal(
    modified.modifications[0].basis,
    "Lenso-authored accessible name; not a pinned upstream translation",
  );
  assert.equal(authoredLocaleModifications("en/other/basic.tsx", adapted).code, adapted);
  const contextual = authoredLocaleModifications(
    "en/input-group/with-loading-suffix.tsx",
    'export function Basic() { return <><TextField name="status"><InputGroup.Input aria-label="Status" /></TextField><InputGroup.Input aria-label="Status" /></>; }',
  );
  assert.equal(contextual.modifications.length, 1);
  assert.match(contextual.code, /aria-label="状态"/);
  assert.match(contextual.code, /aria-label="Status"/);
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-authored-locale-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const source = { examples: { en: {}, cn: {} }, unregisteredSources: [], excludedExamples: [] };
  const name = "input-group-with-loading-suffix";
  for (const locale of ["en", "cn"]) {
    const file = `content/examples/${locale}/input-group/with-loading-suffix.json`;
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true });
    await writeFile(path.join(directory, file), JSON.stringify({ code: original }));
    source.examples[locale][name] = {
      file,
      source: `apps/docs/src/demos/${locale}/input-group/with-loading-suffix.tsx`,
      exported: "Basic",
    };
  }
  await mkdir(path.join(directory, "src/demos/en/input-group"), { recursive: true });
  await writeFile(
    path.join(directory, "src/demos/en/input-group/with-loading-suffix.tsx"),
    adapted,
  );
  await writeFile(path.join(directory, "content/source-index.json"), JSON.stringify(source));
  await assert.rejects(
    generateLocalizedExamples(directory),
    /Pinned Chinese composition input changed/,
  );
});

test("excluded disclosure archives have real pinned public source; source, helper and output drift fail closed", async (t) => {
  const directory =
    process.env.LENSO_DOCS_TEST_ROOT ?? fileURLToPath(new URL("../", import.meta.url));
  const capture = JSON.parse(
    await readFile(path.join(directory, "reference/disclosure-source.json"), "utf8"),
  );
  verifySourceCapture(capture);
  for (const file of Object.keys(sourcePins)) {
    const drift = structuredClone(capture);
    drift.sources[file].code += "\n";
    assert.throws(() => verifySourceCapture(drift), /Pinned public disclosure source changed/);
    const wrongOrigin = structuredClone(capture);
    wrongOrigin.sources[file].url = wrongOrigin.sources[file].url.replace(
      "raw.githubusercontent.com",
      "example.com",
    );
    assert.throws(
      () => verifySourceCapture(wrongOrigin),
      /Pinned public disclosure source changed/,
    );
  }
  const fixture = await mkdtemp(path.join(tmpdir(), "disclosure-pins-"));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await mkdir(path.join(fixture, "reference"), { recursive: true });
  await writeFile(path.join(fixture, "reference/disclosure-source.json"), JSON.stringify(capture));
  for (const file of Object.keys(implementationPins)) {
    await mkdir(path.dirname(path.join(fixture, "src/demos", file)), { recursive: true });
    await writeFile(
      path.join(fixture, "src/demos", file),
      await readFile(path.join(directory, "src/demos", file)),
    );
  }
  await verifyDisclosureInputs(fixture);
  for (const file of Object.keys(implementationPins)) {
    const original = await readFile(path.join(fixture, "src/demos", file), "utf8");
    await writeFile(path.join(fixture, "src/demos", file), original + "\n");
    await assert.rejects(
      verifyDisclosureInputs(fixture),
      /Pinned disclosure React implementation changed/,
    );
    await writeFile(path.join(fixture, "src/demos", file), original);
  }
  const provenance = JSON.parse(
    await readFile(path.join(directory, "src/demos/localization-provenance.json"), "utf8"),
  );
  await verifyDisclosureProvenance(directory, provenance.modules);
  for (const output of Object.keys(outputPins)) {
    const file = output.replace(/^cn\//, "en/");
    const drift = structuredClone(provenance.modules);
    drift[file].sourceHashes.cn = "0".repeat(64);
    await assert.rejects(
      verifyDisclosureProvenance(directory, drift),
      /Invalid disclosure public-source provenance/,
    );
  }
  for (const file of Object.keys(outputPins)) {
    const code = await readFile(path.join(directory, "src/demos", file), "utf8");
    verifyDisclosureOutput(file, code);
    assert.throws(
      () => verifyDisclosureOutput(file, code + "\n"),
      /Pinned Chinese disclosure output changed/,
    );
    const entry = provenance.modules[file.replace(/^cn\//, "en/")];
    assert.equal(entry.sourceAvailability, "hash-pinned-public-upstream");
    assert.equal(entry.status, "source-backed-localized");
    for (const locale of ["en", "cn"]) {
      const archive = JSON.parse(
        await readFile(path.join(directory, entry.records[locale]), "utf8"),
      );
      assert.equal(archive.code, undefined);
      assert.equal(entry.archivedExclusions[locale], archive.excludedReason);
      assert.equal(entry.sourceHashes[locale], sourcePins[file.replace(/^cn\//, `${locale}/`)]);
    }
  }
});

test("visible alert messages translate without translating arbitrary call arguments", () => {
  const en =
    'export const Basic=()=> <button onClick={()=>{alert("Done");save("Done")}}>Done</button>';
  const result = localizeModule(en, en.replaceAll("Done", "完成"), en);
  assert.match(result.code, /alert\("完成"\)/);
  assert.match(result.code, /save\("Done"\)/);
});

test("reviewed pinned CN compositions preserve their exact inputs and output and reject source drift", async () => {
  const directory =
    process.env.LENSO_DOCS_TEST_ROOT ?? fileURLToPath(new URL("../", import.meta.url));
  const cases = [
    "alert-dialog/statuses",
    ...["basic", "max", "count", "sizes", "grid"].map((name) => `avatar-group/${name}`),
    "calendar/multiple-months",
    "color-slider/vertical",
    "color-swatch/transparency",
    "color-swatch/render-function",
    "input-group/with-loading-suffix",
    "meter/colors",
    "number-field/with-step",
    ...[
      "basic",
      "disabled",
      "simple-prev-next",
      "controlled",
      "with-ellipsis",
      "with-summary",
      "custom-icons",
    ].map((name) => `pagination/${name}`),
    "progress-bar/colors",
    "progress-circle/sizes",
    "progress-circle/colors",
    ...["default", "size", "hide-scroll-bar", "custom-styles"].map(
      (name) => `scroll-shadow/${name}`,
    ),
    "spinner/sizes",
    "typography/typography-scale",
  ];
  const hash = (code) => createHash("sha256").update(code).digest("hex");
  for (const name of cases) {
    const file = `en/${name}.tsx`;
    const en = JSON.parse(
      await readFile(path.join(directory, `content/examples/en/${name}.json`), "utf8"),
    ).code;
    const cn = JSON.parse(
      await readFile(path.join(directory, `content/examples/cn/${name}.json`), "utf8"),
    ).code;
    const adapted = await reachableAdaptation(directory, file);
    const result = localizeComposition(file, en, cn, adapted.code);
    assert.deepEqual(result.verifiedComposition.inputHashes, {
      en: hash(en),
      cn: hash(cn),
      adapted: hash(adapted.code),
    });
    assert.equal(result.verifiedComposition.outputSha256, hash(result.code));
    for (const inputs of [
      [en + "\n", cn, adapted.code],
      [en, cn + "\n", adapted.code],
      [en, cn, adapted.code + "\n"],
    ])
      assert.throws(() => localizeComposition(file, ...inputs), /composition input changed/);
    if (name.startsWith("avatar-group/")) {
      assert.match(result.code, /return name.slice\(0, 2\)/);
      assert.match(result.code, /张明/);
      assert.match(result.code, /alt=\{`\$\{user.name\} 的头像`\}/);
      const tree = parse(result.code, { sourceType: "module", plugins: ["typescript", "jsx"] });
      const helper = tree.program.body.find(
        (node) => node.type === "FunctionDeclaration" && node.id.name === "initialsFromName",
      );
      const generate = generateModule.default ?? generateModule;
      const body = generate(helper.body).code;
      const initials = new Function("name", body.slice(1, -1));
      assert.equal(initials("张明"), "张明");
      assert.equal(initials("张"), "张");
      assert.equal(initials("John Doe"), "JD");
      assert.equal(initials("  John   Doe "), "JD");
      assert.equal(initials(""), "");
    }
    if (name.startsWith("scroll-shadow/") && !name.endsWith("custom-styles")) {
      assert.match(result.code, /段落 \{index \+ 1\}/);
      assert.match(result.code, /length: 10/);
      assert.match(result.code, /maxHeight: 240/);
    }
    if (name === "color-swatch/render-function")
      assert.match(result.code, /data-custom=\{name.toLowerCase\(\)\}/);
    if (name === "input-group/with-loading-suffix") {
      assert.match(result.code, /name="status"/);
      assert.match(result.code, /defaultValue="发送中…"/);
    }
    if (name === "typography/typography-scale")
      assert.match(result.code, /sample: "pnpm add @lenso\/ui"/);
  }
});

test("displayed conditional branches translate but their control tests and call arguments do not", () => {
  const en = "export const Basic=()=> <span>Previous</span>";
  const cn = "export const Basic=()=> <span>上一页</span>";
  const adapted =
    'export const Basic=()=> <span>{mode === "Previous" ? "Previous" : run("Previous")}{enabled && "Previous"}</span>';
  const result = localizeModule(en, cn, adapted);
  assert.match(result.code, /mode === "Previous" \? "上一页" : run\("Previous"\)/);
  assert.match(result.code, /enabled && "上一页"/);
});

test("const assertions do not hide display data, while TypeScript literal types stay unchanged", () => {
  const en =
    'type Kind="Open"; const items=[{value:"Open",label:"Open"}] as const; export const Basic=()=> <span>{items[0].label}</span>';
  const result = localizeModule(en, en.replaceAll("Open", "打开"), en);
  assert.match(result.code, /type Kind = "Open"/);
  assert.match(result.code, /value: "Open"/);
  assert.match(result.code, /label: "打开"/);
});

test("paired escaped strings and templates translate without changing CSS, imports, or identifiers", () => {
  const en =
    'import stylex from "@stylexjs/stylex"; import {Label} from "Label"; const css = stylex.create({root:{content:"Label"}}); const LabelData = "Say \\"hello\\""; export function Basic(){return <Label aria-label="Label" placeholder={"Say \\"hello\\""}>{`Hello ${LabelData}!`}</Label>}';
  const cn = en
    .replace('const LabelData = "Say \\"hello\\""', 'const LabelData = "说\\"你好\\""')
    .replace('aria-label="Label"', 'aria-label="标签"')
    .replace('placeholder={"Say \\"hello\\""}', 'placeholder={"说\\"你好\\""}')
    .replace("`Hello ${LabelData}!`", "`你好 ${LabelData}！`");
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /aria-label="标签"/);
  assert.match(result.code, /你好 \$\{LabelData\}！/);
  assert.match(result.code, /content: "Label"/);
  assert.match(result.code, /from "Label"/);
  assert.equal(result.unresolved.length, 0);
});

test("context disambiguates data properties and accessible attributes", () => {
  const en =
    'const item={label:"Open"}; export function Basic(){return <button aria-label="Open">Open</button>}';
  const cn =
    'const item={label:"开启"}; export function Basic(){return <button aria-label="打开按钮">打开</button>}';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /label: "开启"/);
  assert.match(result.code, /aria-label="打开按钮"/);
  assert.match(result.code, />打开<\/button>/);
});

test("paired changes to control IDs, values, names and code literals never become translations", () => {
  const en =
    'const selected="Open"; const item={id:"Open",value:"Open",label:"Open"}; export const Basic=()=> <button id="Open" name="Open" value="Open" aria-label="Open">Open</button>';
  const cn = en.replaceAll("Open", "打开");
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /selected = "Open"/);
  assert.match(result.code, /id: "Open"/);
  assert.match(result.code, /value: "Open"/);
  assert.match(result.code, /id="Open" name="Open" value="Open"/);
  assert.match(result.code, /aria-label="打开"/);
  assert.match(result.code, /label: "打开"/);
});

test("control templates and standalone CSS content remain unchanged even when pinned literals differ", () => {
  const en =
    'const id=`Open`; const styles={root:{content:"Open"}}; const item={name:"Open"}; export const Basic=()=> <button id={id}>{`Open`}</button>';
  const result = localizeModule(en, en.replaceAll("Open", "打开"), en);
  assert.match(result.code, /id = `Open`/);
  assert.match(result.code, /content: "Open"/);
  assert.match(result.code, /name: "Open"/);
  assert.match(result.code, /\{`打开`\}/);
  assert.ok(result.literalSafetyExceptions.some((pair) => pair.context === "code"));
});

test("presentation roles can move into adapted helpers without translating control keys", () => {
  const en = "export const Basic=()=> <span>California</span>";
  const cn = "export const Basic=()=> <span>加利福尼亚</span>";
  const adapted =
    'const choice={value:"California",label:"California"};export const Basic=()=> <Select name="California" label="California" value={choice.value}/>';
  const result = localizeModule(en, cn, adapted);
  assert.match(result.code, /value: "California"/);
  assert.match(result.code, /name="California"/);
  assert.match(result.code, /label: "加利福尼亚"/);
  assert.match(result.code, /label="加利福尼亚"/);
});

test("toast content nested inside an event callback keeps its own presentation context", () => {
  const en =
    'export const Basic=()=> <button onPress={()=>add({title:"Invitation",action:<button>Dismiss</button>})}>Show</button>';
  const cn =
    'export const Basic=()=> <button onPress={()=>add({title:"邀请",action:<button>忽略</button>})}>显示</button>';
  const adapted =
    'const message={title:"Invitation"};export const Basic=()=> <Toast><button>Dismiss</button></Toast>';
  const result = localizeModule(en, cn, adapted);
  assert.match(result.code, /title: "邀请"/);
  assert.match(result.code, />忽略<\/button>/);
});

test("repeated ambiguous words in changed compositions are reported, not guessed", () => {
  const en = "export function Basic(){return <><button>Open</button><button>Open</button></>}";
  const cn = "export function Basic(){return <><button>开启</button><button>打开</button></>}";
  const adapted = "export function Basic(){return <section><button>Open</button></section>}";
  const result = localizeModule(en, cn, adapted);
  assert.match(result.code, />Open<\/button>/);
  assert.equal(result.ambiguities.length, 1);
  assert.equal(result.unresolved.length, 2);
});

test("missing adapted literals and source behavioral differences remain explicit", () => {
  const result = localizeModule(
    "export const Basic=()=> <button onClick={()=>run(1)}>Hello</button>",
    "export const Basic=()=> <button onClick={()=>run(2)}>你好</button>",
    "export const Basic=()=> <button>Other</button>",
  );
  assert.equal(result.structuralDifference, true);
  assert.equal(result.unresolved[0].from, "Hello");
});

test("pinned CN presentation dictionaries localize displayed enums without changing control values", () => {
  const en =
    'export function Colors(){const color="warning";return <Meter color={color}><Label>{color}</Label><Label>Warning</Label></Meter>}';
  const cn =
    'const COLOR_LABELS:Record<string,string>={warning:"警告"};export function Colors(){const color="warning";return <Meter color={color}><Label>{COLOR_LABELS[color]}</Label><Label>警告</Label></Meter>}';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /color = "warning"/);
  assert.match(result.code, /color=\{color\}/);
  assert.match(result.code, /\{COLOR_LABELS\[color\]\}/);
  assert.match(result.code, />警告<\/Label>/);
  assert.equal(result.presentationMaps[0].applied, 1);
});

test("presentation map collisions are reported rather than overwriting adapted identifiers", () => {
  const en = "export const Basic=()=> <span>{size}</span>";
  const cn = 'const SIZES={sm:"小"};export const Basic=()=> <span>{SIZES[size]}</span>';
  const adapted = 'const SIZES={sm:"Custom"};export const Basic=()=> <span>{size}</span>';
  const result = localizeModule(en, cn, adapted);
  assert.match(result.code, /\{size\}/);
  assert.equal(result.presentationAmbiguities[0].reason, "adapted-identifier-collision");
});

test("CN-only uniform accessible attributes are copied from source without replacing dynamic names", () => {
  const en = 'export const Basic=()=> <Avatar.Image src="avatar.jpg"/>';
  const cn = 'export const Basic=()=> <Avatar.Image alt="头像" src="avatar.jpg"/>';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /alt="头像"/);
  assert.match(result.code, /src="avatar.jpg"/);
  const dynamic = localizeModule(
    en,
    cn,
    'export const Basic=()=> <Avatar.Image alt={user.name} src="avatar.jpg"/>',
  );
  assert.match(dynamic.code, /alt=\{user.name\}/);
  assert.equal(dynamic.addedAccessibleAttributes[0].blockedExpressions, 1);
});

test("new helpers and export placement cannot shift source literal alignment", () => {
  const en = "export function Basic(){return <button>Open</button>}";
  const cn =
    'function helper(){return "unused"}; export function Basic(){return <button>打开</button>}';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, />打开<\/button>/);
  assert.equal(result.translations[0].from, "Open");
});

test("translated quoted JSX attributes remain parseable and retain their accessible text", () => {
  const en = 'export const Basic=()=> <input aria-label="Say &quot;hello&quot;"/>';
  const cn = 'export const Basic=()=> <input aria-label="说&quot;你好&quot;"/>';
  const result = localizeModule(en, cn, en);
  assert.match(result.code, /aria-label=\{/);
  assert.doesNotThrow(() => localizeModule(result.code, result.code, result.code));
});

test("source-identical reuse records evidence without retaining a fake Chinese clone", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-identical-locale-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const code = "export default function Basic(){return <span>42</span>}";
  for (const locale of ["en", "cn"]) {
    await mkdir(path.join(directory, `content/examples/${locale}`), { recursive: true });
    await mkdir(path.join(directory, `src/demos/${locale}/example`), { recursive: true });
    await writeFile(
      path.join(directory, `content/examples/${locale}/basic.json`),
      JSON.stringify({ code }),
    );
  }
  await writeFile(path.join(directory, "src/demos/en/example/basic.tsx"), code);
  await writeFile(
    path.join(directory, "src/demos/cn/example/basic.tsx"),
    `// Generated from HeroUI v3.2.6; Apache-2.0.\n${code}`,
  );
  await writeFile(
    path.join(directory, "content/source-index.json"),
    JSON.stringify({
      examples: Object.fromEntries(
        ["en", "cn"].map((locale) => [
          locale,
          {
            basic: {
              source: `apps/docs/src/demos/${locale}/example/basic.tsx`,
              file: `content/examples/${locale}/basic.json`,
            },
          },
        ]),
      ),
    }),
  );
  const manifest = await generateLocalizedExamples(directory);
  assert.equal(manifest.cn.basic, "en/example/basic.tsx");
  await assert.rejects(readFile(path.join(directory, "src/demos/cn/example/basic.tsx")), {
    code: "ENOENT",
  });
  const provenance = JSON.parse(
    await readFile(path.join(directory, "src/demos/localization-provenance.json"), "utf8"),
  );
  assert.equal(provenance.modules[manifest.en.basic].status, "identical-pinned-source-reuse");
});

test("aliases deduplicate generated modules; absent CN helpers point to adapted EN helpers", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "lenso-localize-"));
  await mkdir(path.join(directory, "content/examples/en"), { recursive: true });
  await mkdir(path.join(directory, "content/examples/cn"), { recursive: true });
  await mkdir(path.join(directory, "src/demos/en/button"), { recursive: true });
  const en =
    'import {helper} from "./helper"; const load=()=>import("./helper"); export const Basic=()=> <button>Hello</button>';
  const cn = en.replace("Hello", "你好");
  await writeFile(
    path.join(directory, "content/examples/en/basic.json"),
    JSON.stringify({ code: en }),
  );
  await writeFile(
    path.join(directory, "content/examples/cn/basic.json"),
    JSON.stringify({ code: cn }),
  );
  const record = {
    file: "content/examples/en/basic.json",
    source: "apps/docs/src/demos/en/button/basic.tsx",
  };
  const counterpart = {
    file: "content/examples/cn/basic.json",
    source: "apps/docs/src/demos/cn/button/basic.tsx",
  };
  await writeFile(
    path.join(directory, "content/source-index.json"),
    JSON.stringify({
      examples: {
        en: { basic: record, alias: record },
        cn: { basic: counterpart, alias: counterpart },
      },
    }),
  );
  await writeFile(path.join(directory, "src/demos/en/button/basic.tsx"), en);
  const manifest = await generateLocalizedExamples(directory);
  assert.equal(manifest.cn.basic, manifest.cn.alias);
  const code = await readFile(path.join(directory, "src/demos/cn/button/basic.tsx"), "utf8");
  assert.match(code, /from "\.\.\/\.\.\/en\/button\/helper"/);
  assert.match(code, /import\("\.\.\/\.\.\/en\/button\/helper"\)/);
  assert.match(code, />你好<\/button>/);
  const provenance = JSON.parse(
    await readFile(path.join(directory, "src/demos/localization-provenance.json"), "utf8"),
  );
  assert.equal(Object.keys(provenance.modules).length, 1);
  await writeFile(
    path.join(directory, "src/demos/en/button/helper.tsx"),
    "export function Helper(){return <button>Hello</button>}",
  );
  await writeFile(
    path.join(directory, "src/demos/en/button/basic.tsx"),
    'import {Helper} from "./helper";export function Basic(){return <Helper/>}',
  );
  const helperManifest = await generateLocalizedExamples(directory);
  assert.equal(helperManifest.cn.basic, "cn/button/basic.tsx");
  const helperCode = await readFile(
    path.join(directory, "src/demos/cn/button/basic--helper.tsx"),
    "utf8",
  );
  assert.match(helperCode, />你好<\/button>/);
  const wrapperCode = await readFile(path.join(directory, "src/demos/cn/button/basic.tsx"), "utf8");
  assert.match(wrapperCode, /from "\.\/basic--helper"/);
  const helperEn = "export function Helper(){return <button>Hello</button>}";
  await writeFile(
    path.join(directory, "content/examples/en/helper.json"),
    JSON.stringify({ code: helperEn }),
  );
  await writeFile(
    path.join(directory, "content/examples/cn/helper.json"),
    JSON.stringify({ code: helperEn.replace("Hello", "你好") }),
  );
  await writeFile(
    path.join(directory, "content/source-index.json"),
    JSON.stringify({
      examples: { en: { basic: record }, cn: { basic: counterpart } },
      unregisteredSources: ["en", "cn"].map((locale) => ({
        locale,
        source: `apps/docs/src/demos/${locale}/button/helper.tsx`,
        file: `content/examples/${locale}/helper.json`,
      })),
    }),
  );
  const pairedManifest = await generateLocalizedExamples(directory);
  assert.equal(pairedManifest.cn.basic, "cn/button/basic.tsx");
  const pairedEvidence = JSON.parse(
    await readFile(path.join(directory, "src/demos/localization-provenance.json"), "utf8"),
  ).modules["en/button/basic.tsx"];
  assert.ok(pairedEvidence.helperImports[0].sourceEvidence.applied > 0);
  await writeFile(
    path.join(directory, "src/demos/en/button/basic.tsx"),
    'import {Helper} from "./helper";export function Basic(){return <div/>}',
  );
  assert.equal((await generateLocalizedExamples(directory)).cn.basic, undefined);
  await writeFile(
    path.join(directory, "src/demos/en/button/basic.tsx"),
    'export {Helper as Basic} from "./helper"',
  );
  await generateLocalizedExamples(directory);
  const reexportCode = await readFile(
    path.join(directory, "src/demos/cn/button/basic.tsx"),
    "utf8",
  );
  assert.match(reexportCode, />你好<\/button>/);
  assert.match(reexportCode, /export \{ Helper as Basic \}/);
});
