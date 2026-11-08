import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const directory = fileURLToPath(new URL("./", import.meta.url));
export async function serve(wasmDirectory = "/tmp/lenso-glass-route-wasm", port = 0) {
  const nativeCases: Array<{
    route: string;
    count: number;
    source: string;
    dpr: number;
    profile: string;
    version: number;
    theme: string;
    round?: number;
  }> = [];
  for (const count of [1, 100])
    for (let round = 0; round < 3; round++)
      for (const route of round % 2 ? ["rust", "shader"] : ["shader", "rust"])
        nativeCases.push({
          route,
          count,
          round,
          source: "canvas",
          dpr: 2,
          profile: count === 1 ? "medium" : "small",
          version: 27,
          theme: "dark",
        });
  for (const route of ["shader", "rust", "aave"])
    nativeCases.push({
      route,
      count: 16,
      source: "video",
      dpr: 2,
      profile: "small",
      version: 26,
      theme: "light",
    });
  nativeCases.push(
    {
      route: "aave",
      source: "dom",
      count: 1,
      dpr: 2,
      profile: "medium",
      theme: "dark",
      version: 27,
    },
    {
      route: "html",
      source: "dom",
      count: 1,
      dpr: 2,
      profile: "medium",
      theme: "dark",
      version: 27,
    },
  );
  for (const count of [1, 100])
    for (let round = 0; round < 3; round++)
      nativeCases.push({
        route: "aave",
        source: "canvas",
        count,
        round,
        dpr: 2,
        profile: count === 1 ? "medium" : "small",
        theme: "dark",
        version: 27,
      });
  const bundle = await Bun.build({
    entrypoints: [path.join(directory, "lab.ts")],
    target: "browser",
    format: "esm",
    external: ["/wasm/glass.js"],
  });
  if (!bundle.success) throw new AggregateError(bundle.logs, "Lab build failed");
  const javascript = await bundle.outputs[0]!.text();
  const assets = new Map<string, [string, string]>([
    ["/", [path.join(directory, "index.html"), "text/html"]],
    ["/lab.css", [path.join(directory, "lab.css"), "text/css"]],
    ["/wasm/glass.js", [path.join(wasmDirectory, "glass.js"), "text/javascript"]],
    ["/wasm/glass_bg.wasm", [path.join(wasmDirectory, "glass_bg.wasm"), "application/wasm"]],
    ...[1, 2].map((dpr): [string, [string, string]] => [
      `/scene-${dpr}.mp4`,
      [path.join(wasmDirectory, `scene-${dpr}.mp4`), "video/mp4"],
    ]),
    ...["quad.vert", "blur.frag", "glass.frag"].map((file): [string, [string, string]] => [
      `/shaders/${file}`,
      [path.join(directory, "shaders", file), "text/plain"],
    ]),
  ]);
  const server = createServer(async (req, res) => {
    const requestUrl = new URL(req.url ?? "/", "http://localhost");
    if (requestUrl.pathname === "/lab.js") {
      res.writeHead(200, { "Content-Type": "text/javascript", "Cache-Control": "no-store" });
      res.end(javascript);
      return;
    }
    if (requestUrl.pathname === "/native-case") {
      const index = Number(requestUrl.searchParams.get("index") ?? 0);
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          query: nativeCases[index]
            ? new URLSearchParams(
                Object.entries({ ...nativeCases[index], native: 1, case: index }).map(
                  ([key, value]) => [key, String(value)],
                ),
              ).toString()
            : null,
        }),
      );
      return;
    }
    if (requestUrl.pathname === "/receipt" && req.method === "POST") {
      try {
        let body = "";
        for await (const part of req) {
          body += part;
          if (body.length > 2_000_000) throw new Error("Receipt too large");
        }
        const receipt = JSON.parse(body);
        if (!/^(safari|probe)-\d+$/.test(receipt.id)) throw new Error("Invalid receipt name");
        const folder = process.env.GLASS_LAB_EVIDENCE ?? "/tmp/lenso-glass-route-evidence";
        await mkdir(folder, { recursive: true });
        await writeFile(
          path.join(folder, `${receipt.id}.json`),
          JSON.stringify(receipt.data, null, 2),
        );
        res.end("saved");
      } catch (error) {
        res.writeHead(400);
        res.end(String(error));
      }
      return;
    }
    const asset = assets.get(requestUrl.pathname);
    if (!asset) {
      res.writeHead(404);
      res.end();
      return;
    }
    try {
      res.setHeader("Content-Type", asset[1]);
      res.setHeader("Cache-Control", "no-store");
      const bytes = await readFile(asset[0]);
      if (asset[1] === "video/mp4") {
        res.setHeader("Accept-Ranges", "bytes");
        const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
        if (range) {
          const start = Number(range[1]),
            end = range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
          if (start > end || start >= bytes.length) {
            res.writeHead(416);
            res.end();
            return;
          }
          res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
            "Content-Length": end - start + 1,
          });
          res.end(bytes.subarray(start, end + 1));
          return;
        }
      }
      res.setHeader("Content-Length", bytes.length);
      res.end(bytes);
    } catch (error) {
      res.writeHead(500);
      res.end(String(error));
    }
  });
  await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Lab server has no port");
  return { server, url: `http://127.0.0.1:${address.port}` };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { url } = await serve(process.env.GLASS_LAB_WASM, Number(process.env.GLASS_LAB_PORT ?? 0));
  process.stdout.write(`${url}\n`);
}
