import { loadContextCohort } from "./context-menu-cohort.mjs";
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { serveCohort, fileHash } from "./cohort-server.ts";
const require = createRequire(import.meta.url),
  { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE ?? "playwright");
if (!process.env.EXACT_TEST_DIST)
  throw new Error("Set EXACT_TEST_DIST to an isolated compiled consumer");
const server = serveCohort(process.env.EXACT_TEST_DIST),
  results = [],
  artifacts = path.resolve(
    process.env.LENSO_EXACT_TEST_ARTIFACTS ??
      path.join(import.meta.dirname, "../.cache/acceptance/context-menu-release"),
  );
await Bun.write(path.join(artifacts, ".keep"), "");
try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["webkit", webkit],
  ]) {
    const browser = await launcher.launch();
    try {
      const p = await browser.newPage({ viewport: { width: 820, height: 900 } }),
        errors = [];
      p.on("pageerror", (e) => errors.push(String(e)));
      const network = await loadContextCohort(p, server);
      await p.waitForFunction(() =>
        document.getElementById("context-entry")?.hasAttribute("data-lenso-ready"),
      );
      const target = p.getByTestId("context-entry"),
        root = p.getByTestId("context-actions"),
        isOpen = () => root.evaluate((n) => n.matches(":popover-open"));
      const waitOpen = () =>
        p.waitForFunction(() =>
          document.getElementById("context-actions")?.matches(":popover-open"),
        );
      const begin = async () => {
        await target.scrollIntoViewIfNeeded();
        const b = await target.boundingBox();
        await p.mouse.move(b.x + 20, b.y + 20);
        await p.mouse.down({ button: "right" });
        await waitOpen();
      };
      // A real quick input must survive late dispatch after synchronous rendering work.
      await target.evaluate((n) =>
        n.addEventListener(
          "contextmenu",
          () => {
            const end = performance.now() + 650;
            while (performance.now() < end) {
              /* bounded event-loop stall fixture */
            }
          },
          { once: true },
        ),
      );
      await target.click({ button: "right", position: { x: 20, y: 20 } });
      await waitOpen();
      await p.waitForFunction(() => {
        const n = document.querySelector('#context-actions > [data-slot="menu-backdrop"]');
        return n && getComputedStyle(n).opacity === "1";
      });
      const backdrop = await root.locator(':scope > [data-slot="menu-backdrop"]').evaluate((n) => ({
        display: getComputedStyle(n).display,
        background: getComputedStyle(n).backgroundColor,
        opacity: getComputedStyle(n).opacity,
      }));
      assert.notEqual(backdrop.display, "none");
      assert.equal(backdrop.background, "rgba(0, 0, 0, 0.23)");
      const file = path.join(artifacts, `${engine}-default-modal.png`);
      await p.screenshot({ path: file });
      assert.equal(
        await root
          .locator(':scope > [data-slot="menu-backdrop"]')
          .evaluate((n) =>
            n.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true })),
          ),
        false,
        "the active context backdrop suppresses the browser context menu",
      );
      await p.keyboard.press("Escape");
      await begin();
      await p.keyboard.press("Escape");
      await p.mouse.up({ button: "right" });
      assert.equal(await isOpen(), false, "Escape cancels the opening-release lease");
      await begin();
      await root.evaluate((n) => n.hidePopover());
      await p.mouse.up({ button: "right" });
      await p.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
      assert.equal(await isOpen(), false, "an explicit prior dismissal is not reopened");
      await begin();
      await p.waitForTimeout(600);
      await p.mouse.move(8, 8);
      await p.mouse.up({ button: "right" });
      assert.equal(await isOpen(), false, "a genuine held right-button release outside dismisses");
      assert.deepEqual(errors, []);
      results.push({
        engine,
        version: browser.version(),
        network,
        backdrop,
        file,
        sha256: await fileHash(file),
        escapeCancellation: true,
        explicitDismissal: true,
        heldRelease: true,
        errors,
      });
      console.log(engine, "native release lease and context backdrop passed");
    } finally {
      await browser.close();
    }
  }
  await Bun.write(
    path.join(artifacts, "acceptance.json"),
    JSON.stringify({ completedAt: new Date().toISOString(), results }, null, 2) + "\n",
  );
} finally {
  server.stop();
}
