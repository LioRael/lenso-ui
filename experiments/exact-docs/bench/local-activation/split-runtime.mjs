import assert from "node:assert/strict";
import path from "node:path";
import { parseSync, transformFromAstSync } from "@babel/core";
const parse = (code) =>
  parseSync(code, {
    sourceType: "module",
    parserOpts: { allowUndeclaredExports: true },
    configFile: false,
    babelrc: false,
  });
const print = (ast) =>
  transformFromAstSync(ast, "", { configFile: false, babelrc: false, compact: false }).code;
const namesOf = (n) => {
  const d = n.declaration ?? n;
  return d.type === "VariableDeclaration"
    ? d.declarations.map((x) => x.id.name)
    : d.id
      ? [d.id.name]
      : [];
};
const functions = new Set([
  "node",
  "read",
  "fresh",
  "drop",
  "dispose",
  "onEnd",
  "run",
  "stale",
  "write",
  "writeItem",
  "fm",
  "flush",
  "untracked",
  "fact",
  "sig",
  "long",
  "tooLong",
  "memo",
  "effect",
  "scope",
  "end",
  "endAll",
  "Refusal",
  "Failed",
]);
const vars = new Set([
  "Listener",
  "Owner",
  "Queue",
  "FocusQueue",
  "Flushing",
  "Rev",
  "LateStore",
  "Mask",
  "Settle",
]);
const constants = new Set(["CLEAN", "CHECK", "DIRTY"]);
function rewrite(ast) {
  return transformFromAstSync(ast, "", {
    configFile: false,
    babelrc: false,
    ast: true,
    plugins: [
      () => ({
        visitor: {
          Identifier(p) {
            if (
              !vars.has(p.node.name) ||
              (!p.isReferencedIdentifier() &&
                !p.parentPath.isAssignmentExpression() &&
                !p.parentPath.isUpdateExpression())
            )
              return;
            if (p.parentPath.isObjectProperty() && p.key === "key" && !p.parent.computed) return;
            if (p.parentPath.isMemberExpression() && p.key === "property" && !p.parent.computed)
              return;
            const binding = p.scope.getBinding(p.node.name);
            if (binding && !binding.scope.path.isProgram()) return;
            const name = p.node.name;
            p.replaceWith({
              type: "MemberExpression",
              object: { type: "Identifier", name: "State" },
              property: { type: "Identifier", name },
              computed: false,
            });
            p.skip();
          },
        },
      }),
    ],
  }).ast;
}
export async function splitRuntime(gen) {
  const source = await Bun.file(path.join(gen, "rt.js")).text(),
    ast = parse(source),
    pulled = [],
    kept = [],
    state = [];
  for (const node of ast.program.body) {
    const names = namesOf(node);
    if (names.length && names.every((n) => vars.has(n))) {
      for (const d of (node.declaration ?? node).declarations)
        state.push(
          `${d.id.name}:${print({ type: "File", program: { type: "Program", sourceType: "module", body: [{ type: "ExpressionStatement", expression: d.init }] } }).replace(/;\s*$/, "")}`,
        );
    } else if (names.length && names.every((n) => functions.has(n) || constants.has(n)))
      pulled.push(node);
    else if (
      node.type === "ExportNamedDeclaration" &&
      !node.declaration &&
      node.specifiers.some((s) => functions.has(s.local.name))
    ) {
      const retained = node.specifiers.filter((s) => !functions.has(s.local.name));
      if (retained.length) kept.push({ ...node, specifiers: retained });
    } else if (names.includes("clock")) {
    } else kept.push(node);
  }
  assert.ok(
    pulled.some((n) => namesOf(n).includes("sig")) && state.length === vars.size,
    "Unknown reactive kernel layout",
  );
  const kernel = parse(
    `import {conforms,eq} from './shape.js'; export const State={${state.join(",")}}; export const clock={now:0,timers:[],agent:false,epoch:0};export const budgetHost={say:line=>{(budgetHost.journal??=[]).push(line)}};`,
  );
  kernel.program.body.push(...pulled);
  const exports = [...functions, ...constants].filter(
    (n) => !pulled.some((row) => row.type === "ExportNamedDeclaration" && namesOf(row).includes(n)),
  );
  kernel.program.body.push(...parse(`export {${exports.join(",")}};`).program.body);
  // Before any resource/host exists, the typed counter action needs only the original reactive write/flush phases.
  kernel.program.body.push(
    ...parse(`let installed=null, pending=null; export function installCommit(value){installed=value;}
 export function W(signal,value){if(installed)return installed.W(signal,value);pending.push([signal.n,value]);}
 export function commit(fn){if(installed)return installed.commit(fn);if(pending)return fn();pending=[];const undo=[];try{fn();for(const[n,v]of pending){if(n.t&&!conforms(v,n.t))throw new Refusal('SlotType');if(n.name&&long(v))throw tooLong(n.name);undo.push([n,n.v]);write(n,v);}for(const n of State.Settle)fresh(n);flush();clock.epoch++;return true;}catch(error){for(const[n,v]of undo.reverse())write(n,v);for(const n of State.Settle)fresh(n);flush();return false;}finally{pending=null;}}
 export function act(fn,types,skip=0,names){const run=args=>{for(let i=0;types&&i<types.length;i++){if(!conforms(args[i+skip],types[i]))throw new Refusal('ArgumentType');if(names?.[i]&&long(args[i+skip]))throw tooLong(names[i]);}return fn(...args);};const action=(...args)=>commit(()=>run(args));action.t=f=>(...args)=>commit(()=>run([...f(),...args]));return action;}`)
      .program.body,
  );
  await Bun.write(path.join(gen, "reactive-core.js"), print(rewrite(kernel)));
  const runtime = parse(
    `import {State,clock,budgetHost,installCommit,${[...functions, ...constants].join(",")}} from './reactive-core.js'; export {clock,sig,memo,effect,writeItem,fm,fact,scope,end,untracked,write,onEnd,Refusal,Failed};`,
  );
  runtime.program.body.push(
    ...kept,
    ...parse("Object.assign(budgetHost,{text,say});installCommit({commit,W});").program.body,
  );
  await Bun.write(path.join(gen, "rt.js"), print(rewrite(runtime)));
  const budgetFile = path.join(gen, "budget.js");
  const budget = await Bun.file(budgetFile).text();
  assert.ok(budget.includes('import { Refusal, text, segmentOf, say } from "./rt.js";'));
  await Bun.write(
    budgetFile,
    budget.replace(
      'import { Refusal, text, segmentOf, say } from "./rt.js";',
      'import {Refusal,budgetHost}from "./reactive-core.js";const text=(...args)=>budgetHost.text(...args),segmentOf=(...args)=>budgetHost.segmentOf(...args),say=(...args)=>budgetHost.say(...args);',
    ),
  );
}
