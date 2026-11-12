import assert from "node:assert/strict";
import path from "node:path";
import { parseSync, transformFromAstSync } from "@babel/core";
const options = { configFile: false, babelrc: false };
const parse = (source) =>
  parseSync(source, { ...options, parserOpts: { allowUndeclaredExports: true } });
const print = (ast) => transformFromAstSync(ast, "", options).code;
// Keep the native route model and its mutable bindings in one owner, outside browser projection.
export async function splitRouteState(gen) {
  const file = path.join(gen, "router.js");
  const ast = parse(await Bun.file(file).text());
  const definitions = new Map(),
    imports = new Map(),
    exported = new Set();
  const rows = [];
  for (const row of ast.program.body) {
    if (row.type === "ImportDeclaration") {
      for (const spec of row.specifiers) imports.set(spec.local.name, { row, spec });
      rows.push(row);
      continue;
    }
    const node = row.declaration ?? row;
    if (node.type === "VariableDeclaration")
      for (const declaration of node.declarations) {
        assert.equal(declaration.id.type, "Identifier");
        const name = declaration.id.name;
        const declarationRow = { ...node, declarations: [declaration] };
        definitions.set(name, declarationRow);
        if (row.type === "ExportNamedDeclaration") exported.add(name);
        rows.push(declarationRow);
      }
    else if (["FunctionDeclaration", "ClassDeclaration"].includes(node.type)) {
      definitions.set(node.id.name, node);
      if (row.type === "ExportNamedDeclaration") exported.add(node.id.name);
      rows.push(node);
    } else rows.push(row);
  }
  ast.program.body = rows;
  const dependencies = new Map(),
    writers = new Map();
  transformFromAstSync(ast, "", {
    ...options,
    cloneInputAst: false,
    plugins: [
      () => ({
        visitor: {
          Program(p) {
            for (const [name, node] of definitions) {
              const deps = new Set();
              // Binding references are collected inside this top-level declaration, respecting shadowed parameters.
              for (const [other, binding] of Object.entries(p.scope.bindings))
                for (const reference of binding.referencePaths)
                  if (reference.findParent((q) => q.node === node)) deps.add(other);
              dependencies.set(name, deps);
              writers.set(
                name,
                (p.scope.getBinding(name)?.constantViolations ?? [])
                  .map((q) => q.findParent((q) => q.parentPath?.isProgram())?.node)
                  .filter(Boolean),
              );
            }
          },
        },
      }),
    ],
  });
  const selected = new Set(["routes", "launch", "x_go", "x_top"]);
  let again = true;
  while (again) {
    again = false;
    for (const name of [...selected]) {
      assert.ok(definitions.has(name), `Missing route model binding: ${name}`);
      const next = new Set(dependencies.get(name));
      for (const row of writers.get(name))
        for (const [owner, node] of definitions) if (row === node) next.add(owner);
      for (const dependency of next)
        if (definitions.has(dependency) && !selected.has(dependency)) {
          selected.add(dependency);
          again = true;
        }
    }
  }
  const needed = new Set(
    [...selected]
      .flatMap((name) => [...dependencies.get(name)])
      .filter((name) => imports.has(name)),
  );
  assert.ok(
    !["projectRoots", "pressFeedback", "Hosts"].some((name) => needed.has(name)),
    "Route model reached the browser projection",
  );
  const pure = parse("");
  for (const name of needed) {
    const { row, spec } = imports.get(name);
    pure.program.body.push({ ...structuredClone(row), specifiers: [structuredClone(spec)] });
  }
  for (const [name, declaration] of definitions)
    if (selected.has(name))
      pure.program.body.push({
        type: "ExportNamedDeclaration",
        declaration,
        specifiers: [],
        source: null,
      });
  ast.program.body = rows.filter(
    (row) => ![...selected].some((name) => definitions.get(name) === row),
  );
  // Restore the existing named exports; all full-host readers use the same moved bindings.
  const retainedPublic = [...exported].filter((name) => !selected.has(name));
  ast.program.body.unshift(
    ...parse(
      `import {${[...selected].join(",")}} from './route-state.js';export {${[...selected].filter((name) => exported.has(name)).join(",")}} from './route-state.js';export {${retainedPublic.join(",")}};`,
    ).program.body,
  );
  await Bun.write(file, print(ast));
  await Bun.write(path.join(gen, "route-state.js"), print(pure));
  return [...selected];
}
