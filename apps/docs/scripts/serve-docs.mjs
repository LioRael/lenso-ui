import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

const root = resolve(import.meta.dirname, "../out");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
const redirects = (await readFile(resolve(root, "_redirects"), "utf8"))
  .trim()
  .split("\n")
  .map((line) => line.split(/\s+/));

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    for (const [from, to, status] of redirects) {
      const prefix = from.endsWith("*") ? from.slice(0, -1) : null;
      if (pathname === from || (prefix && pathname.startsWith(prefix))) {
        response.writeHead(Number(status), {
          location: to.replace(":splat", prefix ? pathname.slice(prefix.length) : "") + url.search,
        });
        response.end();
        return;
      }
    }
    const file = resolve(root, `.${pathname}`);
    if (!file.startsWith(root + sep) || ["/_redirects", "/_headers"].includes(pathname)) {
      response.writeHead(404).end();
      return;
    }
    for (const candidate of [file, `${file}.html`, resolve(file, "index.html")]) {
      if (!(await stat(candidate).catch(() => null))?.isFile()) continue;
      response.writeHead(200, {
        "content-type": types[extname(candidate)] ?? "application/octet-stream",
      });
      response.end(request.method === "HEAD" ? undefined : await readFile(candidate));
      return;
    }
    response.writeHead(404, { "content-type": types[".html"] });
    response.end(await readFile(resolve(root, "404.html")));
  } catch {
    response.writeHead(400).end();
  }
}).listen(Number(process.env["PORT"] ?? 3000), "127.0.0.1", () => {
  console.log(`Docs export served at http://127.0.0.1:${process.env["PORT"] ?? 3000}`);
});
