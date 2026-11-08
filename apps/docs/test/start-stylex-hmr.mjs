import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
const component = new URL("../src/components/home-page.tsx", import.meta.url);
const styles = new URL("../src/styles/home.stylex.ts", import.meta.url);
const originalComponent = await readFile(component, "utf8");
const originalStyles = await readFile(styles, "utf8");
assert.ok(
  originalStyles.includes("fontSize: 18,"),
  "The description style edit must have a target",
);

// Waiting only for the final color misses the period when every StyleX rule vanishes.
for (const [name, engine] of [
  ["chromium", chromium],
  ["webkit", webkit],
]) {
  const browser = await engine.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.setDefaultTimeout(15000);
  let rejectNext = false;
  await page.route("**/virtual:stylex.css*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (rejectNext) {
      rejectNext = false;
      await route.abort();
    } else {
      await route.continue();
    }
  });
  try {
    await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector("h1")).fontSize === "64px",
    );
    await page.getByRole("heading", { level: 1, name: /Feels familiar/ }).waitFor();
    await page
      .getByRole("tablist", { name: "Color theme" })
      .locator('[aria-selected="true"]')
      .waitFor();
    await page.getByRole("tab", { name: "Dark theme", exact: true }).click();
    await page.waitForFunction(() => document.documentElement.classList.contains("dark"));
    await page.getByRole("tab", { name: "Light theme", exact: true }).click();
    await page.waitForFunction(() => document.documentElement.classList.contains("light"));
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      window.__stylexFrames = [];
      window.__stylexSampling = true;
      window.__stylexMutations = 0;
      window.__stylexObserver = new MutationObserver((records) => {
        window.__stylexMutations += records.length;
      });
      for (const sheet of document.querySelectorAll("head style"))
        window.__stylexObserver.observe(sheet, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      function sample() {
        const title = document.querySelector("h1");
        if (title) window.__stylexFrames.push(getComputedStyle(title).fontSize);
        if (window.__stylexSampling) requestAnimationFrame(sample);
      }
      sample();
    });
    await writeFile(
      component,
      originalComponent.replace("Feels familiar.", "HMR keeps the page styled."),
    );
    await page.getByRole("heading", { level: 1, name: /HMR keeps the page styled/ }).waitFor();
    await page.waitForTimeout(1200);
    const missing = await page.evaluate(() =>
      window.__stylexFrames.filter((size) => size !== "64px"),
    );
    assert.deepEqual(missing, [], `${name}: active stylesheet disappeared during a text edit`);
    assert.equal(
      await page.evaluate(() => {
        window.__stylexObserver.disconnect();
        return window.__stylexMutations;
      }),
      0,
      `${name}: unchanged CSS must not rewrite active stylesheets`,
    );

    const description = page.locator("h1 + p");
    assert.equal(await description.evaluate((node) => getComputedStyle(node).fontSize), "18px");
    rejectNext = true;
    await writeFile(styles, originalStyles.replace("fontSize: 18,", "fontSize: 19,"));
    await page.waitForFunction(() =>
      document.querySelector("h1")?.textContent.includes("HMR keeps"),
    );
    await page.waitForTimeout(1600);
    assert.equal(rejectNext, false, "The failed replacement request must actually run");
    assert.equal(
      await page.locator("h1").evaluate((node) => getComputedStyle(node).fontSize),
      "64px",
      "A failed CSS request must retain the previous sheet",
    );

    await writeFile(styles, originalStyles.replace("fontSize: 18,", "fontSize: 20,"));
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector("h1 + p")).fontSize === "20px",
    );
    await page.waitForTimeout(700);
    const frames = await page.evaluate(() => {
      window.__stylexSampling = false;
      return window.__stylexFrames;
    });
    assert.ok(frames.length > 30);
    assert.deepEqual(
      frames.filter((size) => size !== "64px"),
      [],
      `${name}: existing styles must survive successful and failed updates`,
    );
    console.log(
      `${name}: ${frames.length} styled frames; text edits keep active stylesheets; failed CSS keeps the previous sheet; subsequent CSS edit applies`,
    );
  } finally {
    await writeFile(component, originalComponent);
    await writeFile(styles, originalStyles);
    await browser.close();
  }
}
