import { parseSync, transformFromAstSync } from "@babel/core";
import path from "node:path";
import assert from "node:assert/strict";
const options = { configFile: false, babelrc: false };
const hostNames = new Set([
  "time",
  "tick",
  "routerValid",
  "unpark",
  "KeyEvent",
  "Propagating",
  "command",
  "Before",
  "Pres",
  "gains",
  "Views",
  "openTabs",
  "settled",
  "Open",
  "closeLetGo",
  "Sounds",
  "Booting",
  "autofocus",
  "Input",
  "Sh",
  "navigation",
  "After",
  "drive",
  "armedAt",
]);
export async function extractTransaction(gen) {
  const file = path.join(gen, "rt.js");
  const source = await Bun.file(file).text();
  const ast = parseSync(source, options);
  const contexts = new Map();
  const mutable = new Set();
  const moved = [];
  transformFromAstSync(ast, source, {
    ...options,
    ast: true,
    cloneInputAst: false,
    plugins: [
      () => ({
        visitor: {
          FunctionDeclaration(p) {
            if (
              !["commit", "settle"].includes(p.node.id?.name) ||
              (!p.parentPath.isExportNamedDeclaration() && !p.parentPath.isProgram())
            )
              return;
            const refs = new Set();
            p.traverse({
              Identifier(q) {
                if (
                  !q.isReferencedIdentifier() &&
                  !q.parentPath.isAssignmentExpression() &&
                  !q.parentPath.isUpdateExpression()
                )
                  return;
                const binding = q.scope.getBinding(q.node.name);
                if (!binding || !binding.scope.path.isProgram()) return;
                if (q.parentPath.isMemberExpression() && q.key === "property" && !q.parent.computed)
                  return;
                if (q.parentPath.isObjectProperty() && q.key === "key" && !q.parent.computed)
                  return;
                const name = q.node.name;
                if (binding.kind === "let" || binding.kind === "var") mutable.add(name);
                refs.add(name);
                q.replaceWith({
                  type: "MemberExpression",
                  object: { type: "Identifier", name: hostNames.has(name) ? "host" : "state" },
                  property: { type: "Identifier", name },
                  computed: false,
                });
                q.skip();
              },
            });
            contexts.set(p.node.id.name, refs);
            moved.push(structuredClone(p.node));
            p.skip();
          },
        },
      }),
    ],
  });
  assert.equal(moved.length, 2, "Expected native transaction and settlement functions");
  const print = (n) => transformFromAstSync(n, "", options).code;
  const factories = moved.map(
    (n) =>
      `export function make_${n.id.name}(state,host){return (${print({ type: "File", program: { type: "Program", sourceType: "module", body: [n] } })});}`,
  );
  await Bun.write(path.join(gen, "transaction.js"), factories.join("\n"));
  const wiring = (name) => {
    const refs = [...contexts.get(name)];
    const object = (host) =>
      `{${refs
        .filter((n) => hostNames.has(n) === host)
        .map(
          (n) => `get ${n}(){return ${n}}${mutable.has(n) ? `,set ${n}(value){${n}=value}` : ""}`,
        )
        .join(",")}}`;
    return `const ${name}=make_${name}(${object(false)},${object(true)});`;
  };
  for (let i = 0; i < ast.program.body.length; i++) {
    const row = ast.program.body[i];
    const fn = row.declaration ?? row;
    if (fn.type === "FunctionDeclaration" && contexts.has(fn.id.name)) {
      const replacement = parseSync(
        `${row.type === "ExportNamedDeclaration" ? "export " : ""}${wiring(fn.id.name)}`,
        options,
      ).program.body[0];
      ast.program.body[i] = replacement;
    }
  }
  ast.program.body.unshift(
    parseSync("import {make_commit,make_settle} from './transaction.js';", options).program.body[0],
  );
  await Bun.write(file, print(ast));
}
