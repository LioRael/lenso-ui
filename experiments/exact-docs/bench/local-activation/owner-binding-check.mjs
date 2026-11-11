import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { parseSync, transformFromAstSync } from "@babel/core";
const root = path.resolve(import.meta.dirname, "../..");
const gen = path.resolve(
  process.argv[2] ?? path.join(root, ".cache/local-activation/verified/.gen"),
);
const shared = new Set([
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
const missing = [];
for (const file of await readdir(gen)) {
  if (!["rt.js", "reactive-core.js"].includes(file) && !/^unit-.*\.js$/.test(file)) continue;
  const source = await Bun.file(path.join(gen, file)).text();
  const ast = parseSync(source, { configFile: false, babelrc: false });
  transformFromAstSync(ast, source, {
    configFile: false,
    babelrc: false,
    plugins: [
      () => ({
        visitor: {
          ReferencedIdentifier(p) {
            if (shared.has(p.node.name) && !p.scope.getBinding(p.node.name))
              missing.push(`${file}:${p.node.loc?.start.line} ${p.node.name}`);
          },
        },
      }),
    ],
  });
}
assert.deepEqual(
  missing,
  [],
  "Shared reactive references, including logical operands, must retain their owner",
);
console.log("Shared reactive owner binding audit passed");
