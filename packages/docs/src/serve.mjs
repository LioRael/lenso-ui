import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { routePath } from "./host.mjs";

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

export async function serve(directory, { port = 4173, host = "127.0.0.1", basePath = "" } = {}) {
  const root = await realpath(directory);
  const redirects = new Map();
  try {
    const file = await realpath(path.join(root, "_redirects"));
    if (!file.startsWith(`${root}${path.sep}`)) throw new Error("Redirect file outside export");
    for (const line of (await readFile(file, "utf8")).split("\n").filter(Boolean)) {
      const [from, to, status, extra] = line.split(/\s+/u);
      if (extra || !["301", "302"].includes(status)) throw new Error("Invalid exported redirect");
      const key = routePath(from, basePath);
      routePath(to, basePath);
      if (redirects.has(key)) throw new Error(`Duplicate exported redirect: ${from}`);
      redirects.set(key, { to, status: Number(status) });
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const server = createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    try {
      const parsed = new URL(request.url, "http://localhost");
      let url = decodeURIComponent(parsed.pathname);
      if (url !== basePath && !url.startsWith(`${basePath}/`)) throw new Error("Outside base path");
      const redirect = redirects.get(url.slice(basePath.length).replace(/\/$/u, "") || "/");
      if (redirect) {
        const target = new URL(`${redirect.to}${parsed.search}`, "http://localhost");
        response
          .writeHead(redirect.status, { Location: `${target.pathname}${target.search}` })
          .end();
        return;
      }
      url = url.slice(basePath.length);
      if (url.includes("\\") || url.includes("\0")) throw new Error("Invalid path");
      const target = path.resolve(root, `.${url || "/"}`);
      let file;
      for (const candidate of [
        target,
        path.join(target, "index.html"),
        ...(target !== root ? [`${target}.html`] : []),
      ]) {
        if ((await stat(candidate).catch(() => null))?.isFile()) {
          file = candidate;
          break;
        }
      }
      if (!file) throw new Error("Missing export");
      if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error("Outside root");
      const resolved = await realpath(file);
      if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error("Outside root");
      const body = await readFile(resolved);
      response.writeHead(200, {
        "Content-Type": contentTypes[path.extname(file)] ?? "application/octet-stream",
        "Content-Length": body.length,
        "Cache-Control": "no-store",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      let body = "Page not found";
      try {
        const fallback = await realpath(path.join(root, "404.html"));
        if (fallback.startsWith(`${root}${path.sep}`)) body = await readFile(fallback);
      } catch {
        // A missing export still receives a real 404, not a successful SPA fallback.
      }
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(request.method === "HEAD" ? undefined : body);
    }
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });
  return server;
}
