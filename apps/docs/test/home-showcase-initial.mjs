import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.waitForLoadState("networkidle");
    const playground = page.getByRole("region", { name: "Typography playground" });
    const text = playground.getByRole("textbox", { name: "Canvas text" });
    const style = (property) =>
      text.evaluate((node, property) => getComputedStyle(node)[property], property);
    assert.equal(await text.inputValue(), "Hello,\nLenso.");
    await text.fill("Something different.");
    await playground.getByRole("combobox", { name: "Typeface" }).click();
    await page.getByRole("option", { name: "Editorial serif", exact: true }).click();
    assert.ok((await style("fontFamily")).includes("Georgia"));
    const size = playground.getByRole("slider", { name: "Size", exact: true });
    await size.focus();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    assert.equal(await style("fontSize"), "25px");
    await playground.getByRole("button", { name: "Align right", exact: true }).click();
    assert.equal(await style("textAlign"), "right");
    await playground.getByRole("button", { name: "Bold", exact: true }).click();
    assert.equal(await style("fontWeight"), "700");
    const dark = playground.getByRole("switch", { name: "Dark canvas" });
    assert.equal(await dark.getAttribute("aria-checked"), "true");
    const beforeColor = await style("color");
    await dark.focus();
    await page.keyboard.press("Space");
    assert.equal(await dark.getAttribute("aria-checked"), "false");
    assert.notEqual(await style("color"), beforeColor);
    assert.equal(await text.inputValue(), "Something different.", "formatting must preserve text");
    await playground.getByRole("button", { name: "Reset playground" }).click();
    assert.equal(await text.inputValue(), "Hello,\nLenso.");
    assert.equal(await style("fontSize"), "88px");
    assert.equal(await style("textAlign"), "left");
    assert.equal(await style("fontWeight"), "500");
    assert.equal(await dark.getAttribute("aria-checked"), "true");
    assert.ok(!(await style("fontFamily")).includes("Georgia"));
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await text.fill("A long unbroken sample: abcdefghijklmnopqrstuvwxyz0123456789");
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
        `${name}/${width}: horizontal overflow`,
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      `${name}: text editing, font, keyboard size/alignment, bold, canvas theme, reset and responsive bounds passed`,
    );
  } finally {
    await browser.close();
  }
}
