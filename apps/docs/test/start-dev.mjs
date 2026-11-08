import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
const reservation = createServer();
reservation.listen(0, "127.0.0.1");
await once(reservation, "listening");
const port = reservation.address().port;
await new Promise((resolve) => reservation.close(resolve));
const cwd = new URL("../", import.meta.url);
const child = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "--port", String(port), "--host", "127.0.0.1"],
  { cwd, stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
for (const stream of [child.stdout, child.stderr])
  stream.on("data", (data) => {
    logs = (logs + data).slice(-20000);
  });
const base = `http://127.0.0.1:${port}`;
try {
  const deadline = Date.now() + 90000;
  while (true) {
    if (child.exitCode !== null) throw new Error(logs);
    try {
      if ((await fetch(base, { signal: AbortSignal.timeout(5000) })).ok) break;
    } catch {}
    if (Date.now() > deadline) throw new Error(`Docs did not start:\n${logs}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  for (const locale of ["en", "cn"]) {
    for (const slug of ["react/getting-started", "react/components/button"]) {
      const response = await fetch(`${base}/${locale}/docs/${slug}`);
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.ok(html.includes(`<html lang="${locale === "cn" ? "zh-CN" : "en"}"`));
      assert.ok(html.includes("<h1"));
      assert.ok(html.includes('rel="canonical"'));
      assert.ok(
        html.includes('data-docs-header-backdrop=""'),
        "The header needs a surface before hydration",
      );
      if (slug.endsWith("button")) {
        assert.ok(html.includes('id="native-api-button"'));
        assert.ok(
          html.includes('data-component-story="Button"'),
          "The playground must be rendered in the initial HTML",
        );
        assert.ok(!html.includes("Loading interactive controls…"));
      }
    }
    assert.equal((await fetch(`${base}/search/${locale}.json`)).status, 200);
  }
  const redirect = await fetch(`${base}/docs/react/components/dropdown`, { redirect: "manual" });
  assert.ok([301, 302, 307, 308].includes(redirect.status));
  assert.ok(redirect.headers.get("location").endsWith("/en/docs/react/components/menu"));
  assert.equal((await fetch(`${base}/en/docs/react/not-a-page`)).status, 404);
  for (const locale of ["en", "cn"])
    assert.equal((await fetch(`${base}/${locale}/theme-builder`)).status, 404);
  console.log(
    "Start dev: bilingual SSR, API content, metadata, search assets, legacy redirect and removed builder routes passed.",
  );
} finally {
  if (child.exitCode === null) {
    child.kill("SIGTERM");
    await once(child, "exit");
  }
}
