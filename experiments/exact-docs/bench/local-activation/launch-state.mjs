import assert from "node:assert/strict";
import path from "node:path";
import { parseSync, transformFromAstSync } from "@babel/core";
const options = { configFile: false, babelrc: false };
const parse = (source) => parseSync(source, options);
const print = (ast) => transformFromAstSync(ast, "", options).code;
// Launch URL parsing is shared with the full host, but does not install its focus/popover listeners.
export async function splitLaunchState(gen) {
  const file = path.join(gen, "navigation.js");
  const ast = parse(await Bun.file(file).text());
  const names = new Set(["AGENT_ADMITTED", "agentParameters", "launchLocation"]);
  const extracted = [];
  ast.program.body = ast.program.body.filter((row) => {
    const node = row.declaration ?? row;
    const name =
      node.id?.name ??
      (node.type === "VariableDeclaration" && node.declarations.length === 1
        ? node.declarations[0].id.name
        : undefined);
    if (!names.has(name)) return true;
    if (name === "AGENT_ADMITTED") assert.equal(node.declarations[0].init.value, false);
    extracted.push({
      type: "ExportNamedDeclaration",
      declaration: node,
      specifiers: [],
      source: null,
    });
    return false;
  });
  assert.equal(extracted.length, names.size, "Native launch parser shape changed");
  const pure = {
    type: "File",
    program: { type: "Program", sourceType: "module", body: extracted },
  };
  transformFromAstSync(pure, "", {
    ...options,
    plugins: [
      () => ({
        visitor: {
          ReferencedIdentifier(p) {
            if (!p.scope.hasBinding(p.node.name))
              assert.ok(
                ["globalThis", "URLSearchParams"].includes(p.node.name),
                `Unexpected launch dependency: ${p.node.name}`,
              );
          },
        },
      }),
    ],
  });
  ast.program.body.unshift(
    ...parse(
      "import {AGENT_ADMITTED,agentParameters,launchLocation} from './launch-state.js';export {launchLocation} from './launch-state.js';",
    ).program.body,
  );
  await Bun.write(file, print(ast));
  await Bun.write(path.join(gen, "launch-state.js"), print(pure));
  const runtime = parse(await Bun.file(path.join(gen, "rt.js")).text());
  const row = runtime.program.body.find(
    (row) =>
      row.type === "ExportNamedDeclaration" &&
      row.source?.value === "./navigation.js" &&
      row.specifiers.some((s) => s.exported.name === "launchLocation"),
  );
  assert.ok(row, "Missing native launch parser re-export");
  row.specifiers = row.specifiers.filter((s) => s.exported.name !== "launchLocation");
  runtime.program.body.push(
    ...parse("export {launchLocation} from './launch-state.js';").program.body,
  );
  await Bun.write(path.join(gen, "rt.js"), print(runtime));
}
