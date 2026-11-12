import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort } from "./cohort-server.ts";
import { loadContextCohort } from "./context-menu-cohort.mjs";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ??
      "packages/ui-exact/.cache/acceptance/glass-magnifier-elastic",
  );
await Bun.write(path.join(artifacts, ".keep"), "");
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const p = await browser.newPage({ viewport: { width: 820, height: 1000 } }),
        network = await loadContextCohort(p, server);
      await p.waitForFunction(() =>
        document.getElementById("magnifier-lens")?.hasAttribute("data-lenso-ready"),
      );
      await p.getByTestId("magnifier-elastic").click();
      await p.getByTestId("magnifier-stage").scrollIntoViewIfNeeded();
      const lens = p.getByTestId("magnifier-lens"),
        box = await lens.boundingBox(),
        x = box.x + 24,
        y = box.y + 24;
      await p.mouse.move(x, y);
      await p.mouse.down();
      await p.mouse.move(x + 45, y + 20, { steps: 4 });
      const active = await lens.evaluate((n) => ({
        translate: n.style.translate,
        press: n.style.getPropertyValue("--lg-press-scale"),
        dragging: n.hasAttribute("data-glass-dragging"),
      }));
      assert.ok(parseFloat(active.translate) > 20);
      assert.notEqual(active.press, "");
      assert.ok(active.dragging);
      await p.mouse.up();
      const old = await lens.elementHandle();
      await p.getByTestId("magnifier-mounted").click();
      assert.equal(await old.evaluate((n) => n.style.getPropertyValue("--lg-press-scale")), "");
      assert.equal(await old.evaluate((n) => n.style.translate), "");
      assert.equal(await old.evaluate((n) => n.hasAttribute("data-glass-dragging")), false);
      let nativeTouch;
      if (engine === "chromium") {
        const mobile = await browser.newContext({
          viewport: { width: 390, height: 844 },
          hasTouch: true,
          isMobile: true,
        });
        try {
          const t = await mobile.newPage(),
            touchNetwork = await loadContextCohort(t, server);
          await t.waitForFunction(() =>
            document.getElementById("magnifier-lens")?.hasAttribute("data-lenso-ready"),
          );
          await t.getByTestId("magnifier-stage").scrollIntoViewIfNeeded();
          const node = t.getByTestId("magnifier-lens"),
            r = await node.boundingBox(),
            cdp = await mobile.newCDPSession(t),
            point = { x: r.x + 24, y: r.y + 24, id: 19 };
          assert.equal(await node.evaluate((n) => getComputedStyle(n).touchAction), "none");
          await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
          for (let i = 1; i <= 4; i++)
            await cdp.send("Input.dispatchTouchEvent", {
              type: "touchMove",
              touchPoints: [{ ...point, x: point.x + i * 12, y: point.y + i * 5 }],
            });
          const during = await node.evaluate((n) => ({
            translate: n.style.translate,
            dragging: n.hasAttribute("data-glass-dragging"),
          }));
          assert.ok(during.dragging);
          assert.ok(parseFloat(during.translate) > 20);
          await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
          assert.equal(await node.getAttribute("data-glass-dragging"), null);
          nativeTouch = {
            network: touchNetwork,
            during,
            result: "native continuous touch drag passed",
          };
        } finally {
          await mobile.close();
        }
      }
      results.push({
        engine,
        version: browser.version(),
        network,
        active,
        elasticCleanup: "passed",
        nativeTouch: nativeTouch ?? "not exercised; no WebKit continuous touch claim",
      });
      console.log(
        engine,
        "combined elastic drag and cleanup passed",
        nativeTouch ? "native touch drag passed" : "",
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  server.stop();
}
await Bun.write(
  path.join(artifacts, "acceptance.json"),
  JSON.stringify({ dist: server.dist, results }, null, 2) + "\n",
);
