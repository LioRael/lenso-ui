import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 430, height: 850 } });
    await page.goto(`${base}/en/photos`, { waitUntil: "networkidle" });
    const search = page.getByRole("button", { name: "Search", exact: true });
    const box = await search.boundingBox();
    assert.ok(box);
    // Swap only the content behind the dock; sample the glass away from text and the rim.
    const backdrop = await page.locator("main[data-photos-demo]").evaluateHandle((main) => {
      const element = document.createElement("div");
      element.style.cssText = "position:fixed;inset:auto 0 0;height:112px;z-index:19";
      main.append(element);
      return element;
    });
    const clip = {
      x: Math.round(box.x + box.width / 2) - 2,
      y: Math.round(box.y + box.height * 0.8),
      width: 4,
      height: 4,
    };
    const luminance = [];
    for (const color of ["black", "white"]) {
      await backdrop.evaluate((element, value) => (element.style.background = value), color);
      const pixels = await page.screenshot({ clip });
      luminance.push(
        await page.evaluate(async (png) => {
          const image = new Image();
          image.src = `data:image/png;base64,${png}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 4;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          const rgba = context.getImageData(0, 0, 4, 4).data;
          return rgba.filter((_, index) => index % 4 !== 3).reduce((a, b) => a + b) / 48;
        }, pixels.toString("base64")),
      );
    }
    const swing = Math.abs(luminance[1] - luminance[0]);
    assert.ok(swing < 50, `${name}: dock material passes too much backdrop contrast (${swing})`);
    console.log(`${name}: Photos dock backdrop contrast swing ${swing.toFixed(1)}/255`);
    await backdrop.evaluate((element) => element.remove());

    await page.getByRole("button", { name: "Sort and filter", exact: true }).click();
    const filters = page.getByRole("menu", { name: "Sort and filter", exact: true });
    const viewOptions = filters.getByRole("menuitem", { name: "View Options", exact: true });
    assert.equal(
      await viewOptions.evaluate((item) => getComputedStyle(item).textShadow),
      "none",
      `${name}: the filter menu inherits the photo header's text shadow`,
    );
    const filtersBox = await filters.boundingBox();
    const countBox = await page.getByText("24 Items", { exact: true }).boundingBox();
    assert.ok(
      filtersBox && countBox && filtersBox.y >= countBox.y + countBox.height,
      `${name}: the filters menu overlaps the library heading`,
    );
    await filters.press("Escape");
    await filters.waitFor({ state: "hidden" });

    await page.getByRole("button", { name: "Open Portrait in red", exact: true }).press("Enter");
    await page.getByRole("button", { name: "Photo options", exact: true }).click();
    const menu = page.getByRole("menu", { name: "Photo options", exact: true });
    const title = page.getByRole("heading", { name: "Portrait in red", includeHidden: true });
    await menu.waitFor();
    const menuBox = await menu.boundingBox();
    const titleBox = await title.boundingBox();
    assert.ok(
      menuBox && titleBox && menuBox.y >= titleBox.y + titleBox.height,
      `${name}: the photo options menu overlaps the viewer title`,
    );
  } finally {
    await browser.close();
  }
}
