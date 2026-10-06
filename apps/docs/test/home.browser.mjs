import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);

async function checkPreviewActivity(page, showcase, list, names) {
  const components = names[0];
  for (const [name, trigger] of [
    [names[1], "Invite"],
    [names[2], "Compose"],
    [names[3], "New conversation"],
    [names[4], "Add transaction"],
  ]) {
    await list.getByRole("tab", { name, exact: true }).click();
    await showcase.getByRole("button", { name: trigger, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    await dialog.waitFor({ state: "hidden" });
    const panel = showcase.getByRole("tabpanel", { name: components, exact: true });
    await panel.waitFor();
    await page.waitForFunction(
      (node) => node === document.activeElement,
      await panel.elementHandle(),
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await showcase.getByRole("tabpanel", { name, exact: true }).waitFor();
    assert.equal(await page.getByRole("dialog").count(), 0, `${name} reopened its inactive dialog`);
  }
  await list.getByRole("tab", { name: names[3], exact: true }).click();
  await showcase.getByRole("button", { name: "Conversations", exact: true }).click();
  const navigation = page.getByRole("dialog", { name: "Conversations", exact: true });
  await navigation.waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await navigation.waitFor({ state: "hidden" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  assert.equal(await page.getByRole("dialog").count(), 0);
  await list.getByRole("tab", { name: names[1], exact: true }).click();
  await showcase.getByRole("button", { name: "Columns", exact: true }).click();
  const columns = page.getByRole("dialog", { name: "Columns", exact: true });
  await columns.waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await columns.waitFor({ state: "hidden" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  assert.equal(await page.getByRole("dialog").count(), 0);
  await list.getByRole("tab", { name: components, exact: true }).click();
}

// The former root redirect and builder tests do not prove homepage routing,
// native home navigation, stable showcase sizing or its mobile fallback.
export async function checkHome(page, base) {
  // Default-locale runs cannot detect currency text diverging from server output.
  for (const locale of ["en-GB", "zh-CN"]) {
    const context = await page.context().browser().newContext({ locale });
    try {
      const localized = await context.newPage();
      const errors = [];
      localized.on("pageerror", (error) => errors.push(error.message));
      localized.on("console", (message) => {
        if (
          /hydration|hydrated|script tag/i.test(message.text()) &&
          ["error", "warning"].includes(message.type())
        )
          errors.push(message.text());
      });
      for (const route of ["/", "/cn", "/en/theme-builder"]) {
        await localized.goto(`${base}${route}`);
        const output = localized.locator('[data-slot="slider-output"]').first();
        assert.equal(await output.textContent(), "$250.00");
        const slider = localized.getByRole("slider", { name: "Price", exact: true }).first();
        await slider.focus();
        await localized.keyboard.press("ArrowRight");
        await localized.waitForFunction(
          () => document.querySelector('[data-slot="slider-output"]').textContent === "$260.00",
        );
        assert.equal(await slider.getAttribute("aria-valuetext"), "$260.00");
      }
      assert.deepEqual(errors, [], `${locale} must not cause hydration or script warnings.`);
    } finally {
      await context.close();
    }
  }
  const remote = [];
  const record = (request) => {
    if (new URL(request.url()).hostname === "heroui.pro") remote.push(request.url());
  };
  page.on("request", record);
  try {
    const serverOnly = await page.context().browser().newContext({ javaScriptEnabled: false });
    try {
      const snapshot = await serverOnly.newPage();
      await snapshot.setViewportSize({ width: 1440, height: 900 });
      await snapshot.goto(base);
      const serverHeader = snapshot.getByRole("banner");
      await serverHeader.getByRole("group", { name: "Color theme", exact: true }).waitFor();
      await serverHeader.getByRole("button", { name: "Change language", exact: true }).waitFor();
      assert.equal(
        await serverHeader
          .getByRole("button", { name: "Search documentation", exact: true })
          .count(),
        1,
        "CSS must expose exactly one search trigger before hydration.",
      );
      const titles = await snapshot.locator('svg[role="img"] > title').allTextContents();
      assert.ok(titles.length >= 7);
      assert.ok(
        titles.every((title) => title.trim().length > 0),
        "Server-rendered chart titles must not be empty.",
      );
      assert.ok(titles.includes("Monthly overview performance"));
      assert.ok(titles.includes("Balance history · May 2026"));
    } finally {
      await serverOnly.close();
    }
    for (const locale of ["en", "cn"]) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const response = await page.goto(`${base}/${locale === "en" ? "" : "cn"}`);
      assert.equal(response.status(), 200);
      assert.equal(new URL(page.url()).pathname, locale === "en" ? "/" : "/cn");
      assert.equal(await page.getByRole("main").count(), 1);
      assert.equal(await page.locator("#nd-sidebar").count(), 0);
      assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
      const canonical = new URL(await page.locator('link[rel="canonical"]').getAttribute("href"));
      assert.equal(canonical.pathname, locale === "en" ? "/" : "/cn");
      assert.equal(
        await page.locator("html").getAttribute("lang"),
        locale === "en" ? "en" : "zh-CN",
      );
      assert.equal(
        await page
          .getByRole("link", { name: locale === "en" ? "Get started" : "开始使用", exact: true })
          .getAttribute("href"),
        `/${locale}/docs/react/getting-started`,
      );
      const header = page.getByRole("banner");
      const searchTrigger = header.getByRole("button", {
        name: "Search documentation",
        exact: true,
      });
      const searchIcon = await searchTrigger.locator("svg").boundingBox();
      assert.ok(searchIcon.width >= 12 && searchIcon.height >= 12);
      await searchTrigger.click();
      const search = page.getByRole("dialog", { name: "Search documentation", exact: true });
      await search
        .getByLabel("Find a page", { exact: true })
        .fill(locale === "en" ? "Button" : "按钮");
      await search.locator("[data-docs-result]").first().waitFor();
      await page.keyboard.press("Escape");
      await search.waitFor({ state: "hidden" });

      const showcase = page.locator("[data-home-showcase]");
      const frame = page.locator("[data-home-showcase-frame]");
      const list = showcase.getByRole("tablist", {
        name: locale === "en" ? "Demo previews" : "演示预览",
        exact: true,
      });
      const components = locale === "en" ? "Components" : "组件";
      const names =
        locale === "en"
          ? ["Components", "Dashboard", "Mail", "Chat", "Finances"]
          : ["组件", "仪表盘", "邮件", "聊天", "财务"];
      const originalFrame = await frame.boundingBox();
      for (const name of names) {
        const tab = list.getByRole("tab", { name, exact: true });
        await tab.click();
        const panel = showcase.getByRole("tabpanel", { name, exact: true });
        await panel.waitFor();
        assert.equal(
          await page.getByRole("main").count(),
          1,
          `${name} introduced another main landmark`,
        );
        assert.equal(await tab.getAttribute("aria-controls"), await panel.getAttribute("id"));
        assert.equal(await panel.getAttribute("aria-labelledby"), await tab.getAttribute("id"));
        const geometry = await frame.boundingBox();
        assert.ok(
          Math.abs(geometry.height - originalFrame.height) < 2,
          `${name} changed the frame height`,
        );
        assert.equal(await page.locator("iframe").count(), 0);
      }
      await checkPreviewActivity(page, showcase, list, names);
      await list.getByRole("tab", { name: components, exact: true }).click();
      await showcase
        .getByRole("option", {
          name: locale === "en" ? "Accent #FF81B9" : "强调色 #FF81B9",
          exact: true,
        })
        .click();
      const editor = showcase.getByRole("link", {
        name: locale === "en" ? "Open Theme Builder" : "在主题配置中心编辑",
        exact: true,
      });
      const seed = new URL(await editor.getAttribute("href"), base);
      assert.equal(seed.pathname, `/${locale}/theme-builder`);
      assert.deepEqual([...seed.searchParams.keys()].sort(), ["chroma", "hue", "lightness"]);
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      const audit = await showcase.evaluate((node) =>
        window.axe.run(node, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
          rules: { "color-contrast": { enabled: false } },
        }),
      );
      assert.deepEqual(
        audit.violations.map((item) => item.id),
        [],
      );
      for (const width of [768, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        assert.equal(await list.isVisible(), false);
        await showcase.getByRole("tabpanel", { name: components, exact: true }).waitFor();
        for (const direction of ["ltr", "rtl"]) {
          await page.evaluate((value) => {
            document.documentElement.dir = value;
          }, direction);
          assert.ok(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1,
            ),
            `${locale}/${width}/${direction} home overflows`,
          );
        }
        if (width === 768) {
          const tabletMenu = header.getByRole("button", { name: /menu/i });
          await tabletMenu.click();
          await header.getByRole("group", { name: "Color theme", exact: true }).waitFor();
          await header.getByRole("button", { name: "Change language", exact: true }).waitFor();
          await page.keyboard.press("Escape");
        }
      }
      await page.evaluate(() => {
        document.documentElement.dir = "ltr";
      });
      const menu = header.getByRole("button", { name: /menu/i });
      await menu.click();
      await header
        .getByRole("link", { name: locale === "en" ? "Docs" : "文档", exact: true })
        .waitFor();
      await page.keyboard.press("Escape");
      await page.waitForFunction(
        (node) => node === document.activeElement,
        await menu.elementHandle(),
      );
    }
    await page.goto(`${base}/en`);
    assert.equal(await page.getByRole("heading", { level: 1 }).count(), 1);
    assert.deepEqual(remote, [], "The homepage must not load commercial remote templates.");
  } finally {
    page.off("request", record);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await checkHome(page, process.env["LENSO_DOCS_TEST_URL"] ?? "http://127.0.0.1:3000");
    assert.deepEqual(errors, []);
    console.log(
      "Homepage routes, search/navigation, native previews, stable sizing, palette seeds and responsive RTL passed.",
    );
  } finally {
    await browser.close();
  }
}
