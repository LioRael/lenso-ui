import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { test } from "bun:test";
import { verifySolidBrowser } from "../../packages/ui-solid/test/browser.ts";

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

    const template = await readFile(join(directory, "out/client/index.html"), "utf8");
    const { renderPage } = await import(
      pathToFileURL(join(directory, "out/server/server.js")).href
    );
    const html: string = renderPage(template);
    assert.match(html, /aria-checked="mixed"/);
    assert.match(html, /data-lenso-slot="checkbox"/);
    await writeFile(join(directory, "out/client/index.html"), html);

    const require = createRequire(join(directory, "package.json"));
    const { createServer, preview } = (await import(
      require.resolve("vite")
    )) as typeof import("vite");
    const devTemplate = await readFile(join(directory, "index.html"), "utf8");
    const dev = await createServer({
      root: directory,
      server: { host: "127.0.0.1", port: 0 },
      plugins: [
        {
          name: "fixture-ssr",
          configureServer(server) {
            server.middlewares.use(async (request, response, next) => {
              if (request.url !== "/") return next();
              try {
                const template = await server.transformIndexHtml("/", devTemplate);
                const { renderPage } = await server.ssrLoadModule("/server.tsx");
                response.setHeader("Content-Type", "text/html");
                response.end(renderPage(template));
              } catch (error) {
                next(error);
              }
            });
          },
        },
      ],
    });
    try {
      await dev.listen();
      const address = dev.httpServer?.address();
      assert(address && typeof address !== "string");
      await verifySolidBrowser(`http://127.0.0.1:${address.port}/`);
    } finally {
      await dev.close();
    }

    const server = await preview({
      root: directory,
      build: { outDir: "out/client" },
      preview: { host: "127.0.0.1", port: 0 },
    });

    try {
      const address = server.httpServer.address();
      assert(address && typeof address !== "string");
      const url = `http://127.0.0.1:${address.port}/`;

      await verifySolidBrowser(url);
    } finally {
      await server.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
