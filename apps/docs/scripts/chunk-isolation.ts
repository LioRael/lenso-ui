import assert from "node:assert/strict";
import path from "node:path";
import type { Plugin } from "vite";

const deferred = [
  /packages\/docs\/(?:dist\/framework|src)\/search-dialog\.[jt]sx?$/,
  /packages\/docs\/(?:dist\/framework|src)\/docs-theme-panel\.[jt]sx?$/,
  /apps\/docs\/src\/stories\/story-source\.tsx$/,
  /apps\/docs\/src\/lib\/page-markdown\.ts$/,
];

export function chunkModules(): Plugin {
  const root = path.resolve(import.meta.dirname, "../../..").replaceAll("\\", "/");
  return {
    name: "lenso-chunk-modules",
    apply: "build",
    generateBundle(_options, bundle) {
      if (this.environment.name !== "client") return;
      const chunks = Object.values(bundle)
        .filter((item) => item.type === "chunk")
        .map((chunk) => ({
          file: chunk.fileName,
          imports: chunk.imports,
          modules: Object.entries(chunk.modules)
            .filter(([, details]) => details.renderedLength > 0)
            .map(([id]) => {
              const clean = id.replaceAll("\0", "").replaceAll("\\", "/").split("?")[0]!;
              const dependency = clean.lastIndexOf("/node_modules/");
              return dependency !== -1
                ? clean.slice(dependency + 1)
                : clean.startsWith(root + "/")
                  ? clean.slice(root.length + 1)
                  : clean;
            }),
        }));
      this.emitFile({
        type: "asset",
        fileName: ".vite/chunk-modules.json",
        source: JSON.stringify(chunks),
      });
    },
  };
}

export function assertChunkIsolation(
  chunks: readonly { file: string; modules: string[] }[],
  loaded: readonly string[],
  route: string,
): void {
  const byFile = new Map(chunks.map((chunk) => [chunk.file, chunk]));
  const initial = loaded.flatMap((file) => {
    const chunk = byFile.get(file);
    assert.ok(chunk, `Missing chunk metadata for ${file}; rebuild the production export`);
    return chunk.modules;
  });
  for (const pattern of deferred) {
    assert.ok(
      chunks.some((chunk) => chunk.modules.some((module) => pattern.test(module))),
      `Missing implementation ownership for ${pattern}; review the isolation policy`,
    );
    assert.deepEqual(
      initial.filter((module) => pattern.test(module)),
      [],
      `${route}: ${pattern} must remain deferred, regardless of chunk name`,
    );
  }
  assert.deepEqual(
    initial.filter((module) =>
      /node_modules\/@shikijs\/(?:engine-oniguruma\/dist\/wasm-inlined|langs\/dist\/typescript)\.mjs$/.test(
        module,
      ),
    ),
    [],
    `${route}: highlighting engines and grammars must remain deferred`,
  );
  const control = chunks.filter((chunk) => /^assets\/control-runtime[-~]/.test(chunk.file));
  assert.equal(control.length, 1, "Expected one control-runtime chunk; review SDK grouping");
  assert.ok(control[0]!.modules.length > 0, "control-runtime metadata must not be empty");
  assert.deepEqual(
    control[0]!.modules.filter(
      (module) =>
        !/^(?:node_modules\/@ui-sdk\/core\/dist\/foundation\/(?!date\/|color\/|(?:[^/]+\/)*sheet|popups\/theme-color)|node_modules\/@ui-sdk\/react\/dist\/(?:render-element|use-primitive|controller-target|children)\.js$|vite\/preload-helper\.js$)/.test(
          module,
        ),
    ),
    [],
    "control-runtime must contain only shared mechanics, not models, sheet physics or application code",
  );
  const icons = chunks.filter((chunk) =>
    chunk.modules.some((module) => module.startsWith("node_modules/@gravity-ui/icons/")),
  );
  assert.equal(icons.length, 1, "Expected one Gravity icons chunk; review icon grouping");
  assert.ok(
    icons[0]!.modules.every((module) => module.startsWith("node_modules/@gravity-ui/icons/")),
    "The shared icons chunk must not capture unrelated implementations",
  );
  if (/^\/(?:en|cn)\/?$/.test(route)) {
    assert.deepEqual(
      initial.filter((module) =>
        /(?:^|\/)content\/lenso\/|apps\/docs\/src\/generated\/lenso-docs-index\.json$/.test(module),
      ),
      [],
      `${route}: document bodies and the document index must not load on the homepage`,
    );
  }
}
