import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { test } from "bun:test";

const app = fileURLToPath(new URL("../", import.meta.url));

// Vite runs under Node in both docs commands; exercise its actual Story plugin there.
test("Story Vite plugin generates controls with TypeScript 7 under Node", async () => {
  const require = createRequire(import.meta.url);
  const plugin = pathToFileURL(require.resolve("@fumadocs/story/vite")).href;
  const script = `
    import assert from "node:assert/strict";
    import { readFile } from "node:fs/promises";
    import story from ${JSON.stringify(plugin)};
    const app = ${JSON.stringify(app)};
    const plugin = story({ tsconfigPath: app + "tsconfig.json" });
    plugin.configResolved({ root: app });
    for (const [name, control] of [["button", "variant"], ["date-picker", "isInvalid"], ["tabs", "value"]]) {
      const filename = app + "src/stories/" + name + ".story.tsx";
      const result = await plugin.transform.handler(await readFile(filename, "utf8"), filename);
      assert.ok(result.includes("_generated:"), "missing controls for " + name);
      assert.ok(result.slice(result.indexOf("_generated:")).includes(control), "missing " + control + " for " + name);
    }
    console.log("generated controls for three Story modules");
    process.exit(0);
  `;
  const result = await promisify(execFile)("node", ["--input-type=module", "-e", script], {
    timeout: 25000,
  });
  assert.match(result.stdout, /generated controls for three Story modules/);
}, 30000);

test.skipIf(process.platform === "win32")(
  "TypeScript sync transport fails promptly if its compiler exits",
  async () => {
    const require = createRequire(import.meta.url);
    const storyRequire = createRequire(require.resolve("@fumadocs/story/vite"));
    const api = pathToFileURL(storyRequire.resolve("typescript/sync")).href;
    const script = `
    import { API } from ${JSON.stringify(api)};
    const client = new API({ tsserverPath: "/usr/bin/false" });
    try { client.parseConfigFile(${JSON.stringify(`${app}tsconfig.json`)}); process.exitCode = 1; }
    catch { console.log("compiler exit detected"); }
    finally { client.close(); }
  `;
    const result = await promisify(execFile)("node", ["--input-type=module", "-e", script], {
      timeout: 5000,
    });
    assert.match(result.stdout, /compiler exit detected/);
  },
);
