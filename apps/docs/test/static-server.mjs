import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

export async function startStaticServer(output = path.resolve(import.meta.dirname, "../out")) {
  output = path.resolve(output);
  const types = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
  };
  const assets = new Map();
  const server = createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
      if (!path.extname(pathname)) pathname += "/index.html";
      const file = path.resolve(output, `.${pathname}`);
      assert.ok(file.startsWith(output + path.sep));
      let asset = assets.get(file);
      if (!asset) {
        const type = types[path.extname(file)] ?? "application/octet-stream";
        const compressed = /text|json|svg/.test(type);
        const bytes = await readFile(file);
        asset = { type, compressed, bytes: compressed ? gzipSync(bytes) : bytes };
        assets.set(file, asset);
      }
      response.setHeader("Content-Type", asset.type);
      response.setHeader("Content-Length", asset.bytes.length);
      if (asset.compressed) response.setHeader("Content-Encoding", "gzip");
      response.end(asset.bytes);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
