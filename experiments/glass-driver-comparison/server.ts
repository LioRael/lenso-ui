import { readFile, writeFile, mkdir } from "node:fs/promises";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { join } from "node:path";
const root = import.meta.dir;
const evidence = process.env["GLASS_DRIVER_EVIDENCE"] ?? "/tmp/lenso-glass-driver-evidence";
const assets = new Map<string, Uint8Array<ArrayBuffer>>();
const sizes: Record<string, { raw: number; gzip: number; brotli: number }> = {};
for (const entry of ["lab", "ts", "wasm"]) {
  const build = await Bun.build({
    entrypoints: [join(root, `${entry}.ts`)],
    target: "browser",
    format: "esm",
    minify: true,
    external: ["/ts.js", "/wasm.js"],
  });
  if (!build.success) throw new AggregateError(build.logs, "Comparison build failed");
  const bytes = new Uint8Array(await build.outputs[0]!.arrayBuffer());
  assets.set(`/${entry}.js`, bytes);
  sizes[entry] = {
    raw: bytes.length,
    gzip: gzipSync(bytes).length,
    brotli: brotliCompressSync(bytes).length,
  };
}
await mkdir(evidence, { recursive: true });
await writeFile(join(evidence, "bundle-sizes.json"), JSON.stringify(sizes, null, 2));
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number(process.env["GLASS_DRIVER_PORT"] ?? 4324),
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/receipt" && request.method === "POST") {
      const body = await request.text();
      if (body.length > 2_000_000) return new Response("Too large", { status: 413 });
      JSON.parse(body);
      await writeFile(join(evidence, `${Date.now()}.json`), body);
      return new Response("Saved");
    }
    if (url.pathname === "/sizes") return Response.json(sizes);
    const asset = assets.get(url.pathname);
    if (asset)
      return new Response(asset, {
        headers: { "Content-Type": "text/javascript", "Cache-Control": "no-store" },
      });
    if (url.pathname === "/")
      return new Response(await readFile(join(root, "index.html")), {
        headers: { "Content-Type": "text/html", "Cache-Control": "no-store" },
      });
    return new Response("Not found", { status: 404 });
  },
});
console.log(server.url.href, sizes);
