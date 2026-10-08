import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { parse } from "@babel/parser";
import { loadConfig } from "@lenso/docs";

const root = path.resolve(import.meta.dirname, "..");
const allDemos = path.join(root, "src/demos/generated.ts");

async function localGraph(entries) {
  const files = new Set();
  async function visit(file) {
    if (files.has(file)) return;
    files.add(file);
    if (!/\.[cm]?[jt]sx?$/.test(file)) return;
    const ast = parse(await readFile(file, "utf8"), {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
    for (const node of ast.program.body) {
      if (
        !["ImportDeclaration", "ExportNamedDeclaration", "ExportAllDeclaration"].includes(node.type)
      )
        continue;
      if (node.importKind === "type" || node.exportKind === "type" || !node.source) continue;
      if (
        node.type === "ImportDeclaration" &&
        node.specifiers.length &&
        node.specifiers.every((specifier) => specifier.importKind === "type")
      )
        continue;
      const specifier = node.source.value;
      const candidate = specifier.startsWith("@/")
        ? path.join(root, "src", specifier.slice(2))
        : specifier.startsWith(".")
          ? path.resolve(path.dirname(file), specifier)
          : undefined;
      if (!candidate) continue;
      for (const target of [
        candidate,
        ...[".ts", ".tsx", ".mjs", ".js", ".jsx", ".json"].map(
          (extension) => candidate + extension,
        ),
        ...[".ts", ".tsx", ".mjs", ".js", ".jsx"].map((extension) =>
          path.join(candidate, "index" + extension),
        ),
      ]) {
        if ((await stat(target).catch(() => null))?.isFile()) {
          await visit(target);
          break;
        }
      }
    }
  }
  for (const entry of entries) await visit(entry);
  return files;
}

// A lazy global registry still makes every import target part of compilation.
// Root/provider code must not make ordinary pages depend on that registry.
test("root and homepage do not statically reach the global demo registry", async () => {
  const config = await loadConfig(root);
  const graph = await localGraph([
    path.join(root, config.root ?? config.components),
    path.join(root, "routes/home.tsx"),
  ]);
  assert.ok(!graph.has(allDemos), "A root layout must not compile all 1,329 demo import targets.");
});

test("component preview infrastructure does not own a global demo dispatcher", async () => {
  const graph = await localGraph([path.join(root, "src/components/component-preview.tsx")]);
  assert.ok(!graph.has(allDemos), "A page must supply only its own example references.");
});

test("ordinary document and navigation modules do not statically reach the full API contract", async () => {
  const graph = await localGraph([
    path.join(root, "docs.components.tsx"),
    path.join(root, "docs.document.tsx"),
    path.join(root, "src/mdx-components.tsx"),
    path.join(root, "routes/home.tsx"),
  ]);
  assert.ok(
    !graph.has(path.join(root, "src/generated/api-reference.json")),
    "Only page-local native API rendering should compile the full API contract.",
  );
});
