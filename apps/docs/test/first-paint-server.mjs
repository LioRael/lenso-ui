import { createServer } from "vite";

export function createFirstPaintServer() {
  return createServer({
    root: new URL("../", import.meta.url).pathname,
    server: { port: 0, strictPort: false, watch: null, hmr: false },
    plugins: [
      {
        name: "first-paint-fixture",
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            if (!request.url.startsWith("/__first-paint")) return next();
            try {
              const theme = request.url.includes("dark") ? "dark" : "light";
              const { render } = await server.ssrLoadModule("/test/first-paint-fixture.server.tsx");
              const html = await server.transformIndexHtml(
                request.url,
                `<!doctype html><html data-theme="${theme}"><head><link rel="stylesheet" href="/src/styles/global.css"><link rel="stylesheet" href="/virtual:stylex.css"></head><body><div id="fixture">${render(theme)}</div><script type="module" src="/test/first-paint-fixture.client.tsx"></script></body></html>`,
              );
              response.setHeader("content-type", "text/html");
              response.end(html);
            } catch (error) {
              next(error);
            }
          });
        },
      },
    ],
  });
}
