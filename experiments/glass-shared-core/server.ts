import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = import.meta.dir;
const wasm = process.env.GLASS_CORE_WASM ?? "/tmp/lenso-glass-core-wasm";
const evidence = process.env.GLASS_CORE_EVIDENCE ?? "/tmp/lenso-glass-core-evidence";
const bundle = await Bun.build({
  entrypoints: [path.join(root, "lab.ts")],
  target: "browser",
  format: "esm",
  external: ["/wasm/glass.js"],
});
if (!bundle.success) throw new AggregateError(bundle.logs, "Comparison bundle failed");
const js = await bundle.outputs[0]!.text();
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: Number(process.env.GLASS_CORE_PORT ?? 4197),
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/receipt" && request.method === "POST") {
      const data = await request.text();
      if (data.length > 2_000_000) return new Response("Too large", { status: 413 });
      JSON.parse(data);
      await mkdir(evidence, { recursive: true });
      await writeFile(path.join(evidence, `${Date.now()}.json`), data);
      return new Response("Saved");
    }
    if (url.pathname === "/lab.js")
      return new Response(js, { headers: { "Content-Type": "text/javascript" } });
    const files: Record<string, [string, string]> = {
      "/": [path.join(root, "index.html"), "text/html"],
      "/wasm/glass.js": [path.join(wasm, "glass.js"), "text/javascript"],
      "/wasm/glass_bg.wasm": [path.join(wasm, "glass_bg.wasm"), "application/wasm"],
    };
    const file = files[url.pathname];
    if (!file) return new Response("Not found", { status: 404 });
    try {
      return new Response(await readFile(file[0]), {
        headers: { "Content-Type": file[1], "Cache-Control": "no-store" },
      });
    } catch (error) {
      return new Response(String(error), { status: 500 });
    }
  },
});
console.log(server.url.href);
