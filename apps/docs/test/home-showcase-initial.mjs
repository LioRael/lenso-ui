import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";

for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    for (const cn of [false, true]) {
      const locale = cn ? "cn" : "en";
      const page = await browser.newPage({
        viewport: cn ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}/${locale}`, { waitUntil: "networkidle" });
      const duo = page.getByRole("region", { name: cn ? "Duo 中的 Music" : "Music in Duo" });
      const library = page.getByRole("region", {
        name: cn ? "各个部分，浑然一体。" : "All the parts. One point of view.",
      });
      assert.ok(
        await library.evaluate((section) =>
          section.previousElementSibling?.contains(document.getElementById("home-duo-stage")),
        ),
        "The component index must immediately follow the Music Duo hero",
      );
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const poster = duo.getByRole("img");
      await poster.evaluate((image) => image.decode());
      assert.equal(await duo.locator("canvas, iframe").count(), 0);
      assert.equal(
        await duo
          .getByRole("link", { name: cn ? "在网页打开 Music" : "Open Music on the web" })
          .getAttribute("href"),
        `/${locale}/music`,
      );
      await duo
        .getByRole("button", { name: cn ? "在 Duo 中体验 Music" : "Try Music in Duo" })
        .press("Enter");
      await duo
        .getByRole("button", { name: cn ? "折叠" : "Fold", exact: true })
        .and(page.locator(":enabled"))
        .waitFor();
      await duo
        .frameLocator('iframe[title="Inner display"]')
        .getByRole("heading", { name: "Home", exact: true })
        .waitFor();
      await duo
        .getByRole("button", { name: cn ? "关闭 Duo 预览" : "Close Duo preview" })
        .press("Space");
      await poster.waitFor();
      assert.equal(await duo.locator("canvas, iframe").count(), 0);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      `${engine.name()}: Music Duo and the adjacent component catalogue passed in both locales`,
    );
  } finally {
    await browser.close();
  }
}
