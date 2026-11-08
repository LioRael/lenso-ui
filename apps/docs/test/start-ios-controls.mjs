import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const fixture = new URL("./ios-controls.html", import.meta.url);
const server = await createServer({
  root: new URL("../", import.meta.url).pathname,
  server: { host: "0.0.0.0", port: 4311, strictPort: true },
  plugins: [
    {
      name: "ios-controls-device-fixture",
      configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
          if (request.url?.split("?")[0] !== "/test/ios-controls.html") return next();
          try {
            const html = await server.transformIndexHtml(
              request.url,
              await readFile(fixture, "utf8"),
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
await server.listen();
server.printUrls();
