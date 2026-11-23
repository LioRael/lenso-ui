import assert from "node:assert/strict";
import { readFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { startStaticServer } from "./static-server.mjs";
import { chromium, webkit } from "playwright";
import { saveBrowserFailure, startDiagnostics } from "./browser-diagnostics.mjs";
import { assertChunkIsolation } from "../scripts/chunk-isolation.ts";

const metadata = new URL("../out/.vite/chunk-modules.json", import.meta.url);
const chunks = JSON.parse(await readFile(metadata, "utf8"));
if (process.env.BROWSER_ARTIFACTS) {
  await mkdir(process.env.BROWSER_ARTIFACTS, { recursive: true });
  await copyFile(metadata, path.join(process.env.BROWSER_ARTIFACTS, "chunk-modules.json"));
}

const server = await startStaticServer();
const { base } = server;

try {
  async function checkEngine([name, engine]) {
    const started = performance.now();
    console.log(`${name}: starting production checks`);
    const browser = await engine.launch();
    try {
      for (const [route, budget, byteBudget, gzipBudget] of [
        ["/en", 85, 1_250_000, 430_000],
        ["/en/docs/react/components/tabs", 125, 2_100_000, 580_000],
        // Cloudflare redirects direct document visits to the directory URL.
        ["/en/docs/react/components/tabs/", 125, 2_100_000, 580_000],
      ]) {
        const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
        await startDiagnostics(page);
        const errors = [];
        const scripts = [];
        let collecting = true;
        page.on("pageerror", (error) => errors.push(error.message));
        page.on("console", (message) => {
          if (
            /Hydration failed|hydration mismatch|A tree hydrated|Minified React error #(?:418|423|425)/i.test(
              message.text(),
            )
          )
            errors.push(message.text());
        });
        page.on("response", (response) => {
          if (collecting && response.request().resourceType() === "script")
            scripts.push(
              Promise.all([response.body(), response.headerValue("content-length")]).then(
                ([body, length]) => ({
                  url: response.url(),
                  code: body.toString(),
                  bytes: body.length,
                  gzip: Number(length),
                }),
              ),
            );
        });
        const documentResponse = await page.goto(base + route);
        if (route.includes("/docs/")) {
          assert.ok(
            (await documentResponse.body()).length <= 2_300_000,
            "Raw Markdown must not return to initial document data",
          );
          assert.ok(
            Number(await documentResponse.headerValue("content-length")) <= 125_000,
            "The document exceeds its gzip HTML budget",
          );
        }
        if (route !== "/en")
          await page.waitForFunction(() => document.querySelector("[data-ready]"));
        await page.waitForLoadState("networkidle");
        collecting = false;
        const loaded = await Promise.all(scripts);
        assertChunkIsolation(
          chunks,
          loaded.map((script) => new URL(script.url).pathname.slice(1)),
          route,
        );
        const decoded = loaded.reduce((n, s) => n + s.bytes, 0);
        const gzip = loaded.reduce((n, s) => n + s.gzip, 0);
        console.log(
          `${name} ${route}: ${loaded.length} scripts, ${decoded} decoded JS bytes, ${gzip} gzip JS bytes`,
        );
        assert.ok(loaded.length <= budget, `${route} exceeds its ${budget}-script budget`);
        assert.ok(decoded <= byteBudget, `${route} exceeds its decoded-JavaScript budget`);
        assert.ok(gzip <= gzipBudget, `${route} exceeds its compressed-JavaScript budget`);
        assert.deepEqual(
          loaded.filter((script) =>
            /\/search-dialog-|\/wasm-inlined-|\/typescript-|\/(?:docs-(?:settings|theme)-panel|story-source|page-markdown)-/.test(
              script.url,
            ),
          ),
          [],
          "Closed search, appearance controls, source and Markdown must load on use",
        );
        if (route === "/en") {
          assert.ok(
            !loaded.some(
              (script) =>
                script.code.includes("content/lenso/") ||
                script.code.includes("en/react/components/tabs.mdx"),
            ),
            "The homepage must not download the document index or MDX registry",
          );
          const settings = page.getByRole("button", { name: "Settings", exact: true });
          await settings.press("Enter");
          const settingsDialog = page.getByRole("dialog", { name: "Settings", exact: true });
          await settingsDialog.getByRole("button", { name: "Appearance", exact: true }).waitFor();
          await page.keyboard.press("Escape");
          await settingsDialog.waitFor({ state: "hidden" });
          assert.ok(await settings.evaluate((node) => document.activeElement === node));

          assert.ok(
            !loaded.some(({ url }) => /\/(?:device-scene|device-lab|music-model)-/.test(url)),
            "The Duo poster must not load the simulator or Music session on first paint",
          );
          await page
            .locator("#main-content")
            .getByRole("link", { name: "View all components" })
            .click();
          await page.getByRole("heading", { name: "Components", exact: true }).waitFor();
        } else {
          await page.getByRole("tab", { name: "Code", exact: true }).first().click();
          await page.locator('[data-component-story="Tabs"] [data-highlighted]').waitFor();
        }
        const trigger = page.locator("[data-docs-search-trigger]:visible").first();
        await trigger.hover();
        await page.waitForFunction(() =>
          performance
            .getEntriesByType("resource")
            .some((entry) => new URL(entry.name).pathname === "/search/en.json"),
        );
        assert.equal(await page.locator("[data-docs-search]").isVisible(), false);
        await trigger.click();
        const panel = page.locator("[data-docs-search]");
        await panel.getByRole("combobox").fill("button");
        await panel.locator("[data-docs-result]").first().waitFor();
        await page.keyboard.press("Escape");
        await panel.waitFor({ state: "hidden" });
        assert.ok(await trigger.evaluate((node) => document.activeElement === node));
        assert.equal(
          await page.evaluate(
            () =>
              performance
                .getEntriesByType("resource")
                .filter((entry) => new URL(entry.name).pathname === "/search/en.json").length,
          ),
          1,
          "Intent preload and the dialog must share one search database request",
        );
        assert.deepEqual(errors, []);
        await page.close();
      }
      for (const locale of ["en", "cn"]) {
        const page = await browser.newPage({ viewport: { width: 1280, height: 960 } });
        await startDiagnostics(page);
        let releaseImages;
        const images = new Promise((resolve) => {
          releaseImages = resolve;
        });
        let pendingImages = 0;
        await page.route("**/assets/demo/photos/*.jpg", async (route) => {
          pendingImages++;
          await images;
          await route.continue();
        });
        try {
          const response = await page.goto(`${base}/${locale}/device-lab/`, {
            waitUntil: "domcontentloaded",
          });
          assert.equal(response.status(), 200, "DeviceLab must be exported as a static route");
          const slider = page.getByRole("slider");
          await slider.waitFor();
          await page.waitForFunction(
            () => document.querySelector('input[type="range"]')?.disabled === false,
          );
          assert.ok(pendingImages > 0, "The readiness check must run with photos still loading");
          assert.equal(await page.locator("output").count(), 0);
          const inner = page.frameLocator('iframe[title="Inner display"]');
          const cover = page.frameLocator('iframe[title="Cover display"]');
          await inner.getByRole("button", { name: "Select", exact: true }).click();
          await page
            .getByRole("button", { name: locale === "en" ? "Fold" : "折叠", exact: true })
            .click();
          await page.waitForFunction((input) => input.value === "0", await slider.elementHandle());
          await cover.getByRole("button", { name: "Cancel selection", exact: true }).click();
          await page
            .getByRole("button", { name: locale === "en" ? "Unfold" : "展开", exact: true })
            .click();
          await page.waitForFunction(
            (input) => input.value === "180",
            await slider.elementHandle(),
          );
          await inner.getByRole("button", { name: "Select", exact: true }).waitFor();
          console.log(
            `${name}/${locale}: exported DeviceLab is interactive across screens while photos are pending.`,
          );
        } finally {
          releaseImages();
          await page.unrouteAll({ behavior: "wait" });
          await page.close();
        }
      }
    } catch (error) {
      await saveBrowserFailure(browser, `production-loading-${name}`);
      throw error;
    } finally {
      await browser.close();
      console.log(`${name}: production checks took ${Math.round(performance.now() - started)}ms`);
    }
  }

  // Wait for both browsers to finish and save their traces before closing the shared server.
  const results = await Promise.allSettled(Object.entries({ chromium, webkit }).map(checkEngine));
  const errors = results
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);
  if (errors.length) throw new AggregateError(errors, "Production browser checks failed");
} finally {
  await server.close();
}
