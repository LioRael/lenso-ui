import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { verifySolidBrowser } from "../../packages/ui-solid/test/browser.ts";

const directory = process.cwd();

const template = await readFile(join(directory, "out/client/index.html"), "utf8");
const { renderPage } = await import(pathToFileURL(join(directory, "out/server/server.js")).href);
const html: string = renderPage(template);
assert.match(html, /aria-checked="mixed"/);
assert.match(html, /data-lenso-slot="checkbox"/);
await writeFile(join(directory, "out/client/index.html"), html);

const require = createRequire(join(directory, "package.json"));
const { createServer, preview } = (await import(require.resolve("vite"))) as typeof import("vite");
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
