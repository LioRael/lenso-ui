import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
for (const [name, engine] of Object.entries({ chromium, webkit })) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 430, height: 850 } });
    await page.goto(`${base}/en/photos`, { waitUntil: "networkidle" });
    assert.equal(await page.getByRole("button", { name: "Show sidebar" }).count(), 0);
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

    const filterTrigger = page.getByRole("button", { name: "Sort and filter", exact: true });
    const filterTriggerBox = await filterTrigger.boundingBox();
    assert.ok(filterTriggerBox);
    await filterTrigger.click();
    const filters = page.getByRole("menu", { name: "Sort and filter", exact: true });
    const viewOptions = filters.getByRole("menuitem", { name: "View Options", exact: true });
    assert.equal(
      await viewOptions.evaluate((item) => getComputedStyle(item).textShadow),
      "none",
      `${name}: the filter menu inherits the photo header's text shadow`,
    );
    const filtersBox = await filters.boundingBox();
    assert.ok(
      filtersBox && Math.abs(filtersBox.y - filterTriggerBox.y) <= 2,
      `${name}: the filters menu expands from the button rather than settling below it`,
    );
    await filters.press("Escape");
    await filters.waitFor({ state: "hidden" });
    assert.ok(await filterTrigger.evaluate((button) => document.activeElement === button));

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

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${base}/en/photos`, { waitUntil: "networkidle" });
    const libraryMain = page.locator("main[data-photos-demo]");
    const header = libraryMain.locator("header");
    const firstPhoto = page.getByRole("button", { name: "Open Portrait in red", exact: true });
    const navigation = page.getByRole("navigation", { name: "Photos navigation" });
    const sidebarTrigger = navigation.getByRole("button", { name: "Show sidebar" });
    const sidebar = page.getByRole("dialog", { name: "Photos", exact: true });
    const libraryTitle = page.getByRole("heading", { name: "Library", exact: true, level: 1 });
    const navBox = await navigation.boundingBox();
    const searchButton = await search.boundingBox();
    assert.ok(navBox && searchButton);
    const navCenter = navBox.y + navBox.height / 2;
    assert.ok(
      Math.abs(navCenter - (searchButton.y + searchButton.height / 2)) < 1,
      `${name}: the tablet navigation and library actions share a centerline`,
    );
    await search.click();
    const searchField = page.getByRole("searchbox", { name: "Search photos" });
    await searchField.evaluate(async (input) => {
      await Promise.allSettled(
        input.parentElement.getAnimations().map((animation) => animation.finished),
      );
    });
    const searchBox = await searchField.boundingBox();
    assert.ok(searchBox);
    assert.ok(
      Math.abs(navCenter - (searchBox.y + searchBox.height / 2)) < 1,
      `${name}: expanding search preserves the toolbar centerline`,
    );
    await page.keyboard.press("Escape");
    const timeline = page.getByRole("tablist", { name: "Library view", exact: true });
    const expectInlineTimeline = async () => {
      await timeline.waitFor();
      assert.deepEqual(await timeline.getByRole("tab").allTextContents(), [
        "Years",
        "Months",
        "All",
      ]);
      assert.equal(await page.getByRole("button", { name: "More tabs", exact: true }).count(), 0);
    };
    await expectInlineTimeline();
    const edge = header.locator('[data-lenso-slot="scroll-edge"]');
    for (const top of [0, 1, 72, 0]) {
      await libraryMain.evaluate((main, scrollTop) => (main.scrollTop = scrollTop), top);
      await edge.waitFor({ state: top ? "attached" : "detached", timeout: 3000 });
      const headerBox = await header.boundingBox();
      const photoBox = await firstPhoto.boundingBox();
      assert.ok(headerBox && photoBox);
      const overlap = headerBox.y + headerBox.height - photoBox.y;
      assert.ok(
        Math.abs(overlap - top) < 1,
        `${name}: the first photo goes under the sticky header only as the gallery scrolls`,
      );
    }
    await sidebarTrigger.press("Enter");
    await sidebar.waitFor({ timeout: 3000 });
    assert.equal(await sidebar.getAttribute("aria-modal"), "true");
    assert.equal(
      await header
        .locator("h1")
        .evaluate((heading) => getComputedStyle(heading.parentElement).opacity),
      "0",
      `${name}: the portrait title is covered`,
    );
    await page.keyboard.press("Escape");
    await sidebar.waitFor({ state: "hidden" });
    assert.equal(
      await sidebarTrigger.evaluate((button) => document.activeElement === button),
      true,
    );

    await page.setViewportSize({ width: 1376, height: 1032 });
    const fullWidthPhoto = await firstPhoto.boundingBox();
    assert.ok(fullWidthPhoto);
    await sidebarTrigger.press("Enter");
    await sidebar.waitFor({ timeout: 3000 });
    await sidebar.evaluate(async (panel) => {
      await Promise.allSettled(panel.getAnimations().map((animation) => animation.finished));
    });
    const [panel, pane] = await Promise.all([sidebar.boundingBox(), libraryMain.boundingBox()]);
    assert.ok(panel && pane);
    assert.ok(Math.abs(panel.x) < 1 && Math.abs(panel.y) < 1, `${name}: the sidebar is flush left`);
    assert.ok(
      Math.abs(pane.x - panel.x - panel.width) < 1,
      `${name}: landscape splits the gallery beside the sidebar`,
    );
    const timelineDock = page.locator('[data-lenso-slot="tabs-list-container"]').filter({
      has: page.getByRole("tablist", { name: "Library view" }),
    });
    const [splitPhoto, bottomTabs] = await Promise.all([
      firstPhoto.boundingBox(),
      timelineDock.boundingBox(),
    ]);
    assert.ok(splitPhoto && bottomTabs);
    assert.ok(splitPhoto.width < fullWidthPhoto.width, `${name}: landscape photos reflow`);
    assert.ok(
      Math.abs(bottomTabs.x + bottomTabs.width / 2 - (pane.x + pane.width / 2)) < 1,
      `${name}: the timeline centers in the gallery pane`,
    );
    assert.equal(await sidebar.getAttribute("aria-modal"), null);
    assert.equal(await libraryTitle.count(), 1, `${name}: the landscape title remains accessible`);
    assert.equal(await sidebarTrigger.count(), 0, `${name}: the capsule is hidden in landscape`);
    await page
      .getByRole("button", { name: "Select", exact: true })
      .click({ trial: true, timeout: 3000 });

    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForFunction(
      () => {
        const pane = document.querySelector("main[data-photos-demo]").getBoundingClientRect();
        return Math.abs(pane.x) < 1 && Math.abs(pane.width - innerWidth) < 1;
      },
      undefined,
      { timeout: 3000 },
    );
    assert.equal(await sidebar.getAttribute("aria-modal"), "true");
    await sidebar.getByRole("button", { name: "Favorites", exact: true }).click();
    await sidebar.waitFor({ state: "hidden" });
    await page.getByRole("heading", { name: "Favorites", exact: true, level: 1 }).waitFor();

    await page.setViewportSize({ width: 320, height: 680 });
    await page.goto(`${base}/en/photos`, { waitUntil: "networkidle" });
    await libraryMain.evaluate((main) => {
      main.scrollTop = 320;
    });
    await edge.waitFor({ state: "attached" });
    await libraryMain.evaluate((main) => {
      main.scrollTop = 240;
    });
    await expectInlineTimeline();
    await timeline.getByRole("tab", { name: "Months", exact: true }).press("Enter");
    await page.getByRole("region", { name: "Photos by month added" }).waitFor();
    await expectInlineTimeline();
    assert.equal(await timeline.getByRole("tab", { selected: true }).textContent(), "Months");
  } finally {
    await browser.close();
  }
}
