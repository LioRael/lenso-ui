import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";
const moduleUrl =
  "/@fs" + fileURLToPath(new URL("../../../packages/glass/dist/index.js", import.meta.url));
const base = process.env.DOCS_URL ?? "http://127.0.0.1:4337";
for (const [name, type] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const b = await type.launch(
    name === "chromium" ? { args: ["--use-angle=metal", "--enable-gpu"] } : {},
  );
  try {
    const p = await b.newPage({ viewport: { width: 500, height: 350 } });
    await p.goto(`${base}/cn/docs/react/components/menu`, { waitUntil: "domcontentloaded" });
    await p.evaluate(async (moduleUrl) => {
      const { createControlLens } = await import(moduleUrl);
      document.body.innerHTML = "";
      document.body.style.cssText = "margin:0;background:white";
      const c = document.createElement("div");
      c.style.cssText =
        "position:absolute;left:60px;top:60px;width:200px;height:130px;background:white;color:black;font:bold 30px monospace;line-height:32px";
      c.textContent = "GLASS GLASS GLASS GLASS GLASS GLASS GLASS";
      document.body.append(c);
      const g = document.createElement("div");
      g.style.cssText =
        "position:absolute;left:60px;top:60px;width:200px;height:130px;border-radius:34px";
      document.body.append(g);
      window.ink = c;
      window.lens = createControlLens(g, c, {
        strength: 0.3,
        dispersion: 0,
        depth: 24,
        dome: 0,
        splay: 1,
        paintsLight: true,
      });
      window.lens.setActive(true);
      window.lens.update(0);
    }, moduleUrl);
    await p.waitForTimeout(100);
    const zero = await p.screenshot();
    await p.evaluate(() => window.lens.update(1));
    await p.waitForTimeout(100);
    const stable = await p.screenshot();
    await p.evaluate(() => {
      const f = document.querySelector("[data-lenso-control-lenses] filter");
      f.id += "-forced";
      window.ink.style.filter = `url("#${f.id}")`;
    });
    await p.waitForTimeout(100);
    const forced = await p.screenshot();
    assert.ok(!zero.equals(stable), "activating refraction must change pixels");
    assert.ok(stable.equals(forced), "parameter updates must repaint without stale cached output");
    console.log("PASS", name, "lens parameter repaint matches forced filter invalidation");
  } finally {
    await b.close();
  }
}
