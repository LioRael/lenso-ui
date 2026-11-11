import { parseSync, transformFromAstSync } from "@babel/core";
import path from "node:path";
import assert from "node:assert/strict";
export async function splitHostCommands(gen) {
  const options = { configFile: false, babelrc: false };
  const file = path.join(gen, "rt.js"),
    source = await Bun.file(file).text();
  const ast = parseSync(source, options);
  const rows = [],
    refs = new Set(),
    imports = new Map();
  transformFromAstSync(ast, source, {
    ...options,
    cloneInputAst: false,
    plugins: [
      () => ({
        visitor: {
          Program(p) {
            for (const row of p.get("body")) {
              const declaration = row.node.declaration ?? row.node;
              const hosts =
                declaration.type === "VariableDeclaration" &&
                declaration.declarations.some((d) => d.id.name === "Hosts");
              const assignment =
                declaration.type === "ExpressionStatement" &&
                declaration.expression.type === "AssignmentExpression" &&
                declaration.expression.left.type === "MemberExpression" &&
                declaration.expression.left.object.name === "Hosts" &&
                ["preventDefault", "stopPropagation"].includes(
                  declaration.expression.left.property.name,
                );
              if (!hosts && !assignment) continue;
              row.traverse({
                Identifier(q) {
                  if (!q.isReferencedIdentifier() || q.node.name === "Hosts") return;
                  const binding = q.scope.getBinding(q.node.name);
                  if (!binding || !binding.scope.path.isProgram()) return;
                  const name = q.node.name;
                  if (binding.kind === "module") {
                    const imp = binding.path.parentPath.node;
                    const spec = imp.specifiers.find((s) => s.local.name === name);
                    imports.set(name, { imp, spec });
                    return;
                  }
                  refs.add(name);
                  q.replaceWith({
                    type: "MemberExpression",
                    object: { type: "Identifier", name: "ctx" },
                    property: { type: "Identifier", name },
                    computed: false,
                  });
                  q.skip();
                },
              });
              if (hosts) {
                rows.push({
                  type: "ExpressionStatement",
                  expression: {
                    type: "CallExpression",
                    callee: {
                      type: "MemberExpression",
                      object: { type: "Identifier", name: "Object" },
                      property: { type: "Identifier", name: "assign" },
                      computed: false,
                    },
                    arguments: [
                      { type: "Identifier", name: "Hosts" },
                      declaration.declarations[0].init,
                    ],
                  },
                });
                declaration.declarations[0].init = { type: "ObjectExpression", properties: [] };
              } else {
                rows.push(structuredClone(row.node));
                row.remove();
              }
            }
          },
        },
      }),
    ],
  });
  assert.ok(rows.length === 3, "Unknown native host command registration layout");
  const print = (n) => transformFromAstSync(n, "", options).code;
  const imported = [...imports.values()].map(({ imp, spec }) => ({
    ...structuredClone(imp),
    specifiers: [structuredClone(spec)],
  }));
  const body = { type: "File", program: { type: "Program", sourceType: "module", body: rows } };
  const host = parseSync(
    `import {Hosts,hostCommandContext} from './rt.js';export function installHostCommands(){const ctx=hostCommandContext();${print(body)}\n}`,
    options,
  );
  host.program.body.unshift(...imported);
  await Bun.write(path.join(gen, "host-commands.js"), print(host));
  ast.program.body.push(
    ...parseSync(
      `export function hostCommandContext(){return {${[...refs].map((n) => `get ${n}(){return ${n}}`).join(",")}}}`,
      options,
    ).program.body,
  );
  await Bun.write(file, print(ast));
}
