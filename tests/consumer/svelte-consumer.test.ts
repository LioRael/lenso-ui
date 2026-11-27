import { execFile } from "node:child_process";
import { access, cp, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { test } from "bun:test";

const workspace = resolve(import.meta.dirname, "../..");
const sveltePackage = join(workspace, "packages/ui-svelte");
const run = promisify(execFile);

test("packed Svelte components keep their styles and native interaction through hydration", async () => {
  const directory = await mkdtemp(join(tmpdir(), "lenso-svelte-consumer-"));

  try {
    await cp(join(sveltePackage, "test/fixture"), directory, { recursive: true });
    const packages: Record<string, string> = {};
    for (const name of ["tokens", "glass", "primitives", "ui-svelte"]) {
      const cwd = join(workspace, "packages", name);
      const { version } = JSON.parse(await readFile(join(cwd, "package.json"), "utf8"));
      await run("bun", ["pm", "pack", "--destination", directory, "--ignore-scripts"], { cwd });
      packages[`@lenso/${name}`] = `file:./lenso-${name}-${version}.tgz`;
    }

    const { dependencies, devDependencies } = JSON.parse(
      await readFile(join(sveltePackage, "package.json"), "utf8"),
    );
    const { workspaces } = JSON.parse(await readFile(join(workspace, "package.json"), "utf8"));
    await writeFile(
      join(directory, "package.json"),
      JSON.stringify({
        private: true,
        type: "module",
        overrides: packages,
        dependencies: {
          ...packages,
          svelte: devDependencies.svelte,
          "@ui-sdk/svelte": dependencies["@ui-sdk/svelte"],
          "@ui-sdk/core": dependencies["@ui-sdk/core"],
          "@stylexjs/stylex": workspaces.catalog["@stylexjs/stylex"],
        },
        devDependencies: {
          "@sveltejs/vite-plugin-svelte": devDependencies["@sveltejs/vite-plugin-svelte"],
          "@stylexjs/unplugin": workspaces.catalog["@stylexjs/unplugin"],
          "svelte-check": devDependencies["svelte-check"],
          typescript: devDependencies.typescript,
          vite: workspaces.catalog.vite,
        },
      }),
    );

    const commands = { cwd: directory };
    await run("bun", ["install", "--prefer-offline", "--ignore-scripts"], commands);
    const source = join(sveltePackage, "src");
    const installed = join(directory, "node_modules/@lenso/ui-svelte/dist");
    const entries = await readdir(source, { recursive: true });
    for (const file of entries) {
      if (file.endsWith(".ts")) {
        const entry = file.slice(0, -3);
        await access(join(installed, `${entry}.js`));
        await access(join(installed, `${entry}.d.ts`));
      } else if (file.endsWith(".svelte")) {
        await access(join(installed, file));
        await access(join(installed, `${file}.d.ts`));
      }
    }
    await run(
      "node",
      ["node_modules/svelte-check/bin/svelte-check", "--tsconfig", "./tsconfig.json"],
      commands,
    );
    const vite = join(directory, "node_modules/vite/bin/vite.js");
    await run("node", [vite, "build", "--outDir", "out/client"], commands);
    await run("node", [vite, "build", "--ssr", "server.ts", "--outDir", "out/server"], commands);
    await run("node", [join(sveltePackage, "test/browser.ts")], commands);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
