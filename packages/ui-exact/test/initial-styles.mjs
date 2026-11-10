import assert from "node:assert/strict";
import path from "node:path";

export async function checkInitialStyles(page, url, engine) {
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  const hold = async (route) => {
    await gate;
    await route.continue();
  };
  const stylesheets = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/lenso-ui/web.css"))
      stylesheets.push(request.url());
  });
  await page.route("**/modules/index.js", hold);
  const snapshot = () =>
    page.evaluate(() => {
      const ids = [
        "action",
        "glass-action",
        "name",
        "notes",
        "subscribe",
        "personal",
        "details-trigger",
        "details-content",
        "account-section-trigger",
        "account-section-content",
        "settings",
      ];
      return Object.fromEntries(
        ids.map((id) => {
          const node = document.querySelector(`[data-testid="${id}"]`);
          const style = getComputedStyle(node);
          const props = [
            "display",
            "height",
            "width",
            "fontSize",
            "lineHeight",
            "borderRadius",
            "paddingLeft",
            "paddingRight",
            "opacity",
          ];
          if (id !== "glass-action") props.push("color", "backgroundColor");
          return [id, Object.fromEntries(props.map((property) => [property, style[property]]))];
        }),
      );
    });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => {
      const node = document.querySelector('[data-testid="action"]');
      return node && getComputedStyle(node).borderRadius === "1000px";
    });
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    assert.equal(
      await page.locator("[data-lenso-ready]").count(),
      0,
      "hatches must remain blocked for this capture",
    );
    assert.equal(
      await page
        .getByTestId("details-content")
        .evaluate((node) => node.getBoundingClientRect().height),
      0,
    );
    const initial = { light: await snapshot(), dark: null };
    await page.screenshot({
      path: path.resolve(import.meta.dirname, `../.cache/example/${engine}-before-hatches.png`),
      fullPage: true,
    });
    await page.getByTestId("theme").click();
    initial.dark = await snapshot();
    await page.screenshot({
      path: path.resolve(
        import.meta.dirname,
        `../.cache/example/${engine}-before-hatches-dark.png`,
      ),
      fullPage: true,
    });
    assert.equal(await page.locator("[data-lenso-ready]").count(), 0);
    await page.getByTestId("theme").click();
    await page.getByTestId("form-readonly").click();
    for (const id of ["name", "notes"])
      assert.equal(await page.getByTestId(id).evaluate((node) => node.readOnly), true);
    await page.getByTestId("form-readonly").click();
    await page.evaluate(() => {
      const unrelated = document.createElement("link");
      unrelated.rel = "stylesheet";
      document.head.prepend(unrelated);
    });
    release();
    await page.waitForFunction(() =>
      [...document.querySelectorAll('[data-hatch="lenso-ui"]')].every((node) =>
        node.hasAttribute("data-lenso-ready"),
      ),
    );
    const enhanced = { light: await snapshot(), dark: null };
    await page.getByTestId("theme").click();
    enhanced.dark = await snapshot();
    await page.getByTestId("theme").click();
    for (const appearance of ["light", "dark"])
      for (const [id, properties] of Object.entries(initial[appearance]))
        for (const [property, before] of Object.entries(properties)) {
          const after = enhanced[appearance][id][property];
          if (/^-?[\d.]+px$/.test(before) && /^-?[\d.]+px$/.test(after))
            assert.ok(
              Math.abs(parseFloat(before) - parseFloat(after)) < 0.5,
              `${id}.${property}: ${before} -> ${after}`,
            );
          else assert.equal(after, before, `${id}.${property}`);
        }
    assert.equal(stylesheets.length, 1, "the hatch must reuse the blocking stylesheet");
    await Bun.write(
      path.resolve(import.meta.dirname, `../.cache/example/${engine}-initial-styles.json`),
      JSON.stringify({ initial, enhanced, stylesheets }, null, 2),
    );
  } finally {
    release();
    await page.unroute("**/modules/index.js", hold);
  }
}
