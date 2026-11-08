// Keep the fixture mounted across dev reloads; allow normal style updates.
export async function keepDevFixture(page, base) {
  const host = new URL(base).host;
  await page.routeWebSocket(
    (url) => url.host === host,
    (socket) => {
      const server = socket.connectToServer();
      server.onMessage((message) => {
        if (typeof message === "string" && /"type"\s*:\s*"full-reload"/.test(message)) return;
        socket.send(message);
      });
    },
  );
}
