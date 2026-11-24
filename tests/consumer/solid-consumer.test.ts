import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { test } from "bun:test";

const workspace = resolve(import.meta.dirname, "../..");
const solidPackage = join(workspace, "packages/ui-solid");
const run = promisify(execFile);

test("packed Solid controls ship styles and retain interaction through hydration", async () => {
  const directory = await mkdtemp(join(tmpdir(), "lenso-solid-consumer-"));

  try {
    await cp(join(solidPackage, "test/fixture"), directory, { recursive: true });
    const packages: Record<string, string> = {};
    for (const name of ["tokens", "glass", "primitives", "ui-solid"]) {
      const cwd = join(workspace, "packages", name);
      const { version } = JSON.parse(await readFile(join(cwd, "package.json"), "utf8"));
      await run("bun", ["pm", "pack", "--destination", directory, "--ignore-scripts"], { cwd });
      packages[`@lenso/${name}`] = `file:./lenso-${name}-${version}.tgz`;
    }

    const { dependencies, devDependencies } = JSON.parse(
      await readFile(join(solidPackage, "package.json"), "utf8"),
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
          "@solidjs/web": devDependencies["@solidjs/web"],
          "solid-js": devDependencies["solid-js"],
          "@ui-sdk/solid": dependencies["@ui-sdk/solid"],
          "@ui-sdk/core": dependencies["@ui-sdk/core"],
          "@stylexjs/stylex": workspaces.catalog["@stylexjs/stylex"],
        },
        devDependencies: {
          "@solidjs/babel-plugin": devDependencies["@solidjs/babel-plugin"],
          "@solidjs/vite-plugin": devDependencies["@solidjs/vite-plugin"],
          "@stylexjs/unplugin": workspaces.catalog["@stylexjs/unplugin"],
          typescript: workspaces.catalog.typescript,
          vite: workspaces.catalog.vite,
        },
      }),
    );

    const commands = { cwd: directory };
    await run("bun", ["install", "--prefer-offline", "--ignore-scripts"], commands);
    await run("bun", ["x", "--no-install", "tsc", "--noEmit"], commands);
    const vite = join(directory, "node_modules/vite/bin/vite.js");
    await run("node", [vite, "build", "--outDir", "out/client"], commands);
    await run("node", [vite, "build", "--ssr", "server.tsx", "--outDir", "out/server"], commands);

    await run("node", [join(import.meta.dirname, "solid-consumer-runtime.ts")], commands);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
