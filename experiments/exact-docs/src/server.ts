import { watch } from "node:fs";
import { realpath, rm } from "node:fs/promises";
import path from "node:path";
import { buildSite } from "./index.ts";

const reloadScript = `<script>(()=>{const events=new EventSource('/__docs/events');events.addEventListener('reload',()=>location.reload());events.addEventListener('build-error',event=>{let message=document.getElementById('__docs-error');if(!message){message=document.createElement('pre');message.id='__docs-error';message.setAttribute('role','alert');document.body.prepend(message)}message.textContent=JSON.parse(event.data)})})();</script>`;

export async function staticResponse(
  request: Request,
  root: string,
  options: { dev?: boolean } = {},
) {
  const url = new URL(request.url);
  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return new Response("Bad URL", { status: 400 });
  }
  const relative = pathname.replace(/^\/+/, "");
  if (relative.split(/[\\/]/).some((segment) => segment.startsWith(".")))
    return new Response("Not found", { status: 404 });
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`))
    return new Response("Not found", { status: 404 });
  let file = Bun.file(resolved);
  if (!path.extname(pathname)) file = Bun.file(path.join(resolved, "index.html"));
  const exists = await file.exists();
  if (!exists) file = Bun.file(path.join(root, "404.html"));
  const status = exists ? 200 : 404;
  if (!(await file.exists())) return new Response("Not found", { status: 404 });
  const headers = { "Cache-Control": options.dev ? "no-store" : "no-cache" };
  if (file.type.startsWith("text/html") && options.dev)
    return new Response((await file.text()) + reloadScript, {
      status,
      headers: { ...headers, "Content-Type": "text/html; charset=utf-8" },
    });
  return new Response(file, { status, headers });
}

/** Serialized rebuilds publish only successful generations. */
export async function startDev(directory: string, port = 3000) {
  const root = await realpath(directory);
  const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();
  let revision = 0;
  let error: string | undefined;
  let current: string | undefined;
  let requested = false;
  let pending: Promise<void> | undefined;
  let closed = false;
  const send = (event: string, data: string) => {
    const bytes = new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    for (const client of clients) client.enqueue(bytes);
  };
  async function rebuild() {
    do {
      requested = false;
      try {
        const result = await buildSite(root, {
          out: path.join(root, ".exact-docs/previews", String(++revision)),
        });
        const previous = current;
        current = result.out;
        error = undefined;
        send("reload", String(revision));
        console.log("Documentation ready");
        if (previous) await rm(previous, { recursive: true, force: true });
      } catch (cause) {
        error = cause instanceof Error ? cause.message : String(cause);
        console.error(error);
        send("build-error", error);
      }
    } while (requested && !closed);
  }
  const queue = () => {
    requested = true;
    if (!pending)
      pending = rebuild().finally(() => {
        pending = undefined;
      });
  };
  let timer: ReturnType<typeof setTimeout> | undefined;
  const watcher = watch(root, { recursive: true }, (_event, filename) => {
    if (
      !filename ||
      filename
        .split(/[\\/]/)
        .some(
          (segment) =>
            segment.startsWith(".") || ["dist", "node_modules", "target"].includes(segment),
        )
    )
      return;
    clearTimeout(timer);
    timer = setTimeout(queue, 100);
  });
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port,
    idleTimeout: 0,
    async fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === "/__docs/events") {
        if (request.headers.get("origin") && request.headers.get("origin") !== url.origin)
          return new Response("Forbidden", { status: 403 });
        let controller: ReadableStreamDefaultController<Uint8Array>;
        return new Response(
          new ReadableStream<Uint8Array>({
            start(value) {
              controller = value;
              clients.add(value);
              value.enqueue(new TextEncoder().encode(": connected\n\n"));
              if (error)
                value.enqueue(
                  new TextEncoder().encode(
                    `event: build-error\ndata: ${JSON.stringify(error)}\n\n`,
                  ),
                );
            },
            cancel() {
              clients.delete(controller);
            },
          }),
          { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } },
        );
      }
      if (!current) {
        const message = (error ?? "Building documentation…")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;");
        return new Response(
          `<!doctype html><title>Exact Docs</title><body><pre id="__docs-error" role="alert">${message}</pre>${reloadScript}`,
          {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
          },
        );
      }
      return staticResponse(request, current, { dev: true });
    },
  });
  queue();
  return {
    url: server.url,
    ready: () => pending,
    async stop() {
      closed = true;
      watcher.close();
      clearTimeout(timer);
      for (const client of clients) client.close();
      clients.clear();
      await server.stop(true);
      await pending;
    },
  };
}
