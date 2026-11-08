import path from "node:path";
import { transformAsync } from "@babel/core";
import stylex from "@stylexjs/babel-plugin";
import type { BunPlugin } from "bun";

// Match the consumer's required StyleX compilation, including its shipped token declarations.
const declarations: BunPlugin = {
  name: "glass-consumer-stylex",
  setup(build) {
    build.onLoad({ filter: /packages\/(styles|docs)\/dist\/.*\.js$/ }, async ({ path: file }) => {
      const source = await Bun.file(file).text();
      if (!source.includes("@stylexjs/stylex")) return { contents: source, loader: "js" };
      const result = await transformAsync(source, {
        filename: file,
        babelrc: false,
        configFile: false,
        plugins: [
          [
            stylex,
            { dev: false, runtimeInjection: true, unstable_moduleResolution: { type: "commonJS" } },
          ],
        ],
      });
      return { contents: result?.code ?? source, loader: "js", resolveDir: path.dirname(file) };
    });
  },
};
const built = await Bun.build({
  entrypoints: [path.join(import.meta.dir, "consumer.ts")],
  plugins: [declarations],
  target: "browser",
  format: "esm",
  splitting: true,
});
if (!built.success) throw new AggregateError(built.logs, "Consumer fixture build failed");
const assets = new Map(built.outputs.map((output) => [`/${path.basename(output.path)}`, output]));
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number(process.env["GLASS_CONSUMER_PORT"] ?? 4198),
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/")
      return new Response(
        `<!doctype html><html><head><meta charset="utf-8"><title>Glass package integration</title><link rel="stylesheet" href="/consumer.css"></head><body><script type="module" src="/consumer.js"></script></body></html>`,
        { headers: { "Content-Type": "text/html", "Cache-Control": "no-store" } },
      );
    const asset = assets.get(url.pathname);
    return asset
      ? new Response(asset, {
          headers: { "Content-Type": asset.type, "Cache-Control": "no-store" },
        })
      : new Response("Not found", { status: 404 });
  },
});
console.log(server.url.href);
