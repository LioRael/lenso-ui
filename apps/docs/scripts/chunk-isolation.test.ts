import assert from "node:assert/strict";
import { test } from "bun:test";
import { assertChunkIsolation } from "./chunk-isolation.ts";

const graph = [
  {
    file: "assets/control-runtime-123.js",
    modules: [
      "node_modules/@ui-sdk/core/dist/foundation/kernel/controller.js",
      "node_modules/@ui-sdk/core/dist/foundation/drag-and-drop/pointer.js",
    ],
  },
  { file: "assets/icons-456.js", modules: ["node_modules/@gravity-ui/icons/esm/Bold.js"] },
  { file: "assets/shell-789.js", modules: ["apps/docs/src/components/home-playground.tsx"] },
  { file: "assets/a.js", modules: ["packages/docs/dist/framework/search-dialog.js"] },
  { file: "assets/b.js", modules: ["packages/docs/dist/framework/docs-theme-panel.js"] },
  { file: "assets/c.js", modules: ["apps/docs/src/stories/story-source.tsx"] },
  { file: "assets/d.js", modules: ["apps/docs/src/lib/page-markdown.ts"] },
  { file: "assets/e.js", modules: ["apps/docs/src/generated/lenso-docs-index.json"] },
];
const initial = graph.slice(0, 3).map((chunk) => chunk.file);

test("accepts deferred implementations regardless of their chunk names", () => {
  assert.doesNotThrow(() => assertChunkIsolation(graph, initial, "/en"));
  assert.doesNotThrow(() =>
    assertChunkIsolation(graph, [...initial, "assets/e.js"], "/en/docs/react/components/tabs"),
  );
});

// A permitted filename must not conceal an eagerly loaded implementation.
test("rejects lazy implementations merged into an initially loaded chunk", () => {
  for (const deferred of [
    ...graph.slice(3, 7),
    { modules: ["node_modules/@shikijs/langs/dist/typescript.mjs"] },
    { modules: ["node_modules/@shikijs/engine-oniguruma/dist/wasm-inlined.mjs"] },
  ]) {
    const merged = graph.map((chunk) =>
      chunk.file === "assets/shell-789.js"
        ? { ...chunk, modules: [...chunk.modules, ...deferred.modules] }
        : chunk,
    );
    assert.throws(() => assertChunkIsolation(merged, initial, "/en"), /must remain deferred/);
  }
});

test("rejects transitive SDK models and application code in the shared control runtime", () => {
  for (const module of [
    "node_modules/@ui-sdk/core/dist/foundation/color/parse.js",
    "node_modules/@ui-sdk/core/dist/foundation/date/value.js",
    "node_modules/@ui-sdk/core/dist/foundation/popups/sheet-driver.js",
    "node_modules/@ui-sdk/core/dist/foundation/motion/sheet-spring.js",
    "node_modules/@ui-sdk/core/dist/foundation/popups/theme-color.js",
    "apps/docs/src/router.tsx",
  ]) {
    const merged = graph.map((chunk) =>
      chunk.file.startsWith("assets/control-runtime-")
        ? { ...chunk, modules: [...chunk.modules, module] }
        : chunk,
    );
    assert.throws(() => assertChunkIsolation(merged, initial, "/en"), /control-runtime/);
  }
});

test("rejects the homepage document index even when its chunk has an unrelated name", () => {
  assert.throws(() => assertChunkIsolation(graph, [...initial, "assets/e.js"], "/en"), /document/);
});

test("rejects unrelated code captured by the shared icons chunk", () => {
  const merged = graph.map((chunk) =>
    chunk.file === "assets/icons-456.js"
      ? { ...chunk, modules: [...chunk.modules, "apps/docs/src/router.tsx"] }
      : chunk,
  );
  assert.throws(() => assertChunkIsolation(merged, initial, "/en"), /icons chunk/);
});

test("fails closed when module coverage or required ownership disappears", () => {
  assert.throws(
    () => assertChunkIsolation(graph, [...initial, "assets/unknown.js"], "/en"),
    /metadata/,
  );
  assert.throws(
    () =>
      assertChunkIsolation(
        graph.filter((chunk) => chunk.file !== "assets/a.js"),
        initial,
        "/en",
      ),
    /search-dialog/,
  );
  assert.throws(
    () =>
      assertChunkIsolation(
        graph.filter((chunk) => !chunk.file.startsWith("assets/control-runtime-")),
        [],
        "/en",
      ),
    /control-runtime/,
  );
});
