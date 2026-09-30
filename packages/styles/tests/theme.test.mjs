import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { chromium } from "playwright";

test("nested themes resolve mixes and radius overrides independently", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const css = await Promise.all(
      ["themes/shared/theme.css", "themes/default/variables.css"].map((file) =>
        readFile(new URL(`../${file}`, import.meta.url), "utf8"),
      ),
    );
    await page.setContent(`
      <style>${css.join("\n")}
      .probe { color: var(--foreground); background: var(--surface-hover);
        border-radius: var(--radius-xl); outline-color: var(--accent-hover); }
      .expected { background: color-mix(in oklab, var(--surface) 92%, var(--surface-foreground) 8%);
        outline-color: color-mix(in oklab, var(--accent) 90%, var(--accent-foreground) 10%); }
      </style>
      <div class="light" id="outer"><div class="probe" id="light"></div>
        <div data-theme="dark" id="scope"><div class="probe" id="dark"></div>
          <div class="light"><div class="probe" id="nested"></div></div>
          <div class="expected" id="expected"></div>
        </div>
      </div>
    `);
    const sample = () =>
      page.evaluate(() => {
        const style = (id) => getComputedStyle(document.getElementById(id));
        return {
          light: style("light").color,
          dark: style("dark").color,
          nested: style("nested").color,
          background: style("dark").backgroundColor,
          expectedBackground: style("expected").backgroundColor,
          accent: style("dark").outlineColor,
          expectedAccent: style("expected").outlineColor,
          radius: style("dark").borderTopLeftRadius,
          lightRadius: style("light").borderTopLeftRadius,
        };
      });
    const before = await sample();
    assert.notEqual(before.light, before.dark);
    assert.equal(before.nested, before.light);
    assert.equal(before.background, before.expectedBackground);
    assert.equal(before.accent, before.expectedAccent);
    assert.notEqual(before.background, "rgba(0, 0, 0, 0)");
    await page.evaluate(() => {
      const scope = document.getElementById("scope");
      scope.removeAttribute("data-theme");
      scope.className = "dark";
    });
    assert.deepEqual(await sample(), before);
    await page.evaluate(() => {
      const scope = document.getElementById("scope");
      scope.style.setProperty("--accent", "oklch(0.7 0.15 140)");
      scope.style.setProperty("--radius", "20px");
    });
    const after = await sample();
    assert.notEqual(after.accent, before.accent);
    assert.equal(after.accent, after.expectedAccent);
    assert.equal(after.radius, "30px");
    assert.equal(after.lightRadius, before.lightRadius);
  } finally {
    await browser.close();
  }
});
