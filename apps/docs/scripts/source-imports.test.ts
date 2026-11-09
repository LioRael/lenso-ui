import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "bun:test";
import { createServer, type ViteDevServer } from "vite";
import { sourceImports } from "./source-imports.ts";

async function fixture(
  files: Record<string, string>,
  check: (server: ViteDevServer, root: string) => Promise<void>,
) {
  const root = await mkdtemp(path.join(tmpdir(), "lenso-source-imports-"));
  let server: ViteDevServer | undefined;
  try {
    await Promise.all(
      Object.entries(files).map(([name, code]) => writeFile(path.join(root, name), code)),
    );
    const entry = path.join(root, "index.ts");
    server = await createServer({
      root,
      configFile: false,
      cacheDir: path.join(root, "cache"),
      resolve: { alias: { "@example/ui": entry } },
      plugins: [sourceImports({ "@example/ui": entry })],
      server: { middlewareMode: true },
      optimizeDeps: { noDiscovery: true, include: [] },
    });
    await check(server, root);
  } finally {
    await server?.close();
    await rm(root, { recursive: true, force: true });
  }
}

// The old root import evaluates the unused module and throws, even though the
// requested component is exported by a different, independent leaf.
test("named and type imports retain aliases without evaluating unrelated exports", async () => {
  await fixture(
    {
      "index.ts":
        'export * from "./unused.js"; export { item as Button } from "./button.js"; export { default as CloseIcon } from "./close.js"; export type Options = { value: string };',
      "unused.ts": 'throw new Error("Unrelated component evaluated"); export const unused = 0;',
      "button.ts": "export const item = 42;",
      "close.ts": 'export default "close";',
      "consumer.ts":
        'import { Button as Action, CloseIcon, type Options } from "@example/ui"; const options: Options = {value:"ok"}; export const answer = [Action, CloseIcon, options.value];',
    },
    async (server) => {
      assert.deepEqual((await server.ssrLoadModule("/consumer.ts")).answer, [42, "close", "ok"]);
    },
  );
});

test("an entry with initialization keeps its side effects and namespace exports", async () => {
  await fixture(
    {
      "index.ts":
        'import "./setup.js"; export { item as Button } from "./button.js"; export default "default";',
      "setup.ts": 'globalThis.__lensoSourceImportEffect = "initialized";',
      "button.ts": "export const item = 42;",
      "consumer.ts":
        'import fallback, * as namespace from "@example/ui"; import {Button} from "@example/ui"; export const answer = [fallback, namespace.Button, Button, globalThis.__lensoSourceImportEffect];',
    },
    async (server) => {
      try {
        assert.deepEqual((await server.ssrLoadModule("/consumer.ts")).answer, [
          "default",
          42,
          42,
          "initialized",
        ]);
      } finally {
        Reflect.deleteProperty(globalThis, "__lensoSourceImportEffect");
      }
    },
  );
});

test("moving an export during development updates the importer", async () => {
  await fixture(
    {
      "index.ts": 'export { item as Button } from "./first.js";',
      "first.ts": "export const item = 1;",
      "second.ts": "export const item = 2;",
      "consumer.ts": 'import { Button } from "@example/ui"; export const answer = Button;',
    },
    async (server, root) => {
      assert.equal((await server.ssrLoadModule("/consumer.ts")).answer, 1);
      await writeFile(path.join(root, "index.ts"), 'export { item as Button } from "./second.js";');
      const deadline = Date.now() + 3000;
      while ((await server.ssrLoadModule("/consumer.ts")).answer !== 2 && Date.now() < deadline)
        await new Promise((resolve) => setTimeout(resolve, 50));
      assert.equal((await server.ssrLoadModule("/consumer.ts")).answer, 2);
    },
  );
});
