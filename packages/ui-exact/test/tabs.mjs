import assert from "node:assert/strict";
import path from "node:path";

// Test the Base UI tab contract through real Exact actions and preserved panels.
export async function checkTabs(page, engine) {
  const viewport = page.viewportSize();
  const theme = await page.locator("[data-theme]").first().getAttribute("data-theme");
  const root = page.getByTestId("tabs-demo");
  const list = page.getByTestId("tabs-demo-list");
  const account = page.getByTestId("tabs-account");
  const security = page.getByTestId("tabs-security-tab");
  const billing = page.getByTestId("tabs-billing-tab");
  const button = (name) => page.getByTestId(`tabs-${name}`);
  const selected = async (tab) => {
    await page.waitForFunction(
      ({ id }) => document.getElementById(id)?.getAttribute("aria-selected") === "true",
      { id: await tab.getAttribute("id") },
    );
  };
  const focused = async (tab) =>
    assert.equal(await tab.evaluate((n) => n === document.activeElement), true);
  const ownerAccount = async () => {
    await button("account-select").click();
    await selected(account);
  };
  await list.scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    document.getElementById("tabs-demo-list").hasAttribute("data-lenso-ready"),
  );
  assert.equal(await page.getByRole("tablist", { name: "Workspace sections" }).count(), 1);
  assert.equal(await list.getByRole("tab").count(), 3);
  assert.equal(
    await list
      .locator('[data-slot="tabs-row"] [data-site], [data-slot="tabs-centre-row"] [data-hatch]')
      .count(),
    0,
  );
  assert.equal(await list.locator('[data-slot="tabs-row"]').evaluate((n) => n.inert), true);
  assert.equal(await security.getAttribute("aria-disabled"), "true");
  assert.equal(await security.evaluate((n) => n.disabled), false);
  await selected(account);
  const lift = await list.evaluate(async (node) => {
    const { element } = await import(
      new URL("./modules/lenso-ui/browser.js", document.baseURI).href
    );
    const { tabsLiftRule } = await import(
      new URL("./modules/style-config/index.js", document.baseURI).href
    );
    const handle = { hatch: "lenso-ui", element: node, data: node.dataset };
    element(handle, { xstyle: tabsLiftRule.xstyle });
    const custom = getComputedStyle(node).getPropertyValue("--lg-lens-grow-x").trim();
    element(handle);
    return { custom, restored: getComputedStyle(node).getPropertyValue("--lg-lens-grow-x").trim() };
  });
  assert.deepEqual(lift, { custom: "41px", restored: "27px" });
  assert.equal(await account.getAttribute("aria-controls"), "tabs-account-panel");
  assert.equal(
    await page.getByTestId("tabs-account-panel").getAttribute("aria-labelledby"),
    "tabs-account",
  );
  assert.equal(
    await page.getByTestId("tabs-security-panel").evaluate((n) => n.hidden && n.inert),
    true,
  );
  await account.focus();
  await page.keyboard.press("ArrowRight");
  await selected(billing);
  await focused(billing);
  await page.keyboard.press("ArrowRight");
  await selected(account);
  await page.keyboard.press("End");
  await selected(billing);
  await page.keyboard.press("Home");
  await selected(account);
  await security.focus();
  await selected(account);
  await billing.click({ button: "right" });
  await selected(account);
  await button("manual").click();
  await ownerAccount();
  await account.focus();
  await page.keyboard.press("ArrowRight");
  await focused(billing);
  await selected(account);
  assert.equal(await account.getAttribute("tabindex"), "-1");
  await page.keyboard.press("Enter");
  await selected(billing);
  await page.keyboard.press("ArrowLeft");
  await selected(billing);
  await focused(account);
  await page.keyboard.press("Space");
  await selected(account);
  await button("loop").click();
  await billing.focus();
  await page.keyboard.press("ArrowRight");
  await focused(billing);
  await button("rtl").click();
  await page.waitForFunction(() => {
    const root = document.getElementById("tabs-demo-list");
    const active = root.querySelector('[role="tab"][aria-selected="true"]').getBoundingClientRect();
    const lens = root.querySelector('[data-slot="tabs-indicator"]').getBoundingClientRect();
    return Math.abs(active.x + active.width / 2 - lens.x - lens.width / 2) < 1;
  });
  await account.focus();
  await page.keyboard.press("ArrowLeft");
  await focused(billing);
  await selected(account);
  await button("vertical").click();
  await billing.focus();
  await page.keyboard.press("ArrowUp");
  await focused(account);
  await button("security").click();
  await account.focus();
  await page.keyboard.press("ArrowDown");
  await focused(security);
  await page.keyboard.press("Enter");
  await selected(security);
  await button("disabled").click();
  const count = await page.getByTestId("tabs-changes").textContent();
  await billing.evaluate((n) => n.click());
  await security.focus();
  await page.keyboard.press("ArrowDown");
  assert.equal(await page.getByTestId("tabs-changes").textContent(), count);
  await selected(security);
  await button("disabled").click();
  const reselect = await page.getByTestId("tabs-changes").textContent();
  await security.evaluate((n) => n.click());
  assert.equal(await page.getByTestId("tabs-changes").textContent(), reselect);
  await button("accept").click();
  await ownerAccount();
  await billing.focus();
  await page.keyboard.press("Enter");
  await selected(account);
  await button("accept").click();
  await button("manual").click();
  await button("vertical").click();
  await button("rtl").click();
  await ownerAccount();
  await list.scrollIntoViewIfNeeded();
  const original = await account.elementHandle();
  const from = await account.boundingBox(),
    to = await billing.boundingBox();
  const before = Number((await page.getByTestId("tabs-changes").textContent()).split(": ")[1]);
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 10 });
  await page.mouse.up();
  await selected(billing);
  assert.equal(
    Number((await page.getByTestId("tabs-changes").textContent()).split(": ")[1]),
    before + 1,
  );
  assert.equal(await account.evaluate((n, original) => n === original, original), true);
  await billing.focus();
  await button("billing").evaluate((n) => n.click());
  await selected(account);
  await focused(account);
  await button("billing").click();
  await ownerAccount();
  const notes = page.getByTestId("tabs-notes");
  await notes.fill("Edited draft");
  const saved = await notes.elementHandle();
  await billing.click();
  await selected(billing);
  assert.equal(
    await page.getByTestId("tabs-account-panel").evaluate((n) => n.hidden && n.inert),
    true,
  );
  assert.equal(await notes.evaluate((n, saved) => n === saved, saved), true);
  await billing.focus();
  await page.keyboard.press("Tab");
  await focused(page.getByTestId("tabs-billing-panel"));
  await button("keep").click();
  assert.equal(await notes.count(), 0);
  await page.waitForFunction(
    () => !document.getElementById("tabs-account").hasAttribute("aria-controls"),
  );
  await account.click();
  await selected(account);
  assert.equal(await notes.inputValue(), "Edited draft");
  assert.equal(await notes.evaluate((n, saved) => n === saved, saved), false);
  await saved.dispose();
  await button("size").click();
  assert.equal(Math.round((await account.boundingBox()).height), 46);
  await button("glass-toggle").click();
  const track = list.locator('[data-slot="tabs-glass"]');
  await page.waitForFunction(
    () =>
      document.querySelector('[data-slot="tabs-glass"]').getAttribute("data-material") ===
      "glass-small",
  );
  const lens = track.locator('[data-lenso-kind="tabs-track-lens"]');
  assert.equal(await lens.count(), 1);
  await track.evaluate((n) => n.setAttribute("data-contrast", "increased"));
  await page.waitForFunction(() =>
    document.querySelector('[data-slot="tabs-glass"]').hasAttribute("data-material-opaque"),
  );
  assert.equal(await lens.evaluate((n) => getComputedStyle(n).display), "none");
  await track.evaluate((n) => n.removeAttribute("data-contrast"));
  await page.emulateMedia({ forcedColors: "active" });
  await page.waitForFunction(() =>
    document.querySelector('[data-slot="tabs-glass"]').hasAttribute("data-material-opaque"),
  );
  await button("elastic").click();
  assert.equal(await list.getAttribute("data-lenso-elastic"), "false");
  assert.equal(await list.evaluate((n) => n.style.getPropertyValue("--lg-press-scale")), "");
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  await billing.click();
  await selected(billing);
  const indicator = await list.locator('[data-slot="tabs-indicator"]').boundingBox();
  const active = await billing.boundingBox();
  assert.ok(Math.abs(indicator.x + indicator.width / 2 - active.x - active.width / 2) < 1);
  assert.ok(Math.abs(indicator.y + indicator.height / 2 - active.y - active.height / 2) < 1);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await button("elastic").click();
  await button("glass-toggle").click();
  for (const orientation of ["horizontal", "vertical"]) {
    if ((await list.getAttribute("aria-orientation")) !== orientation)
      await button("vertical").click();
    for (const appearance of ["light", "dark"]) {
      await page
        .locator("[data-theme]")
        .first()
        .evaluate((n, appearance) => n.setAttribute("data-theme", appearance), appearance);
      for (const width of [390, 820]) {
        await page.setViewportSize({ width, height: 844 });
        await root.scrollIntoViewIfNeeded();
        await page.locator("#tabs-examples").screenshot({
          path: path.resolve(
            import.meta.dirname,
            `../.cache/example/${engine}-tabs-${orientation}-${appearance}-${width}.png`,
          ),
        });
      }
    }
  }
  const old = await list.elementHandle();
  await button("visible").click();
  assert.equal(await old.evaluate((n) => n.isConnected), false);
  assert.equal(await old.evaluate((n) => n.hasAttribute("data-lenso-ready")), false);
  await button("visible").click();
  await selected(billing);
  await original.dispose();
  await old.dispose();
  await page
    .locator("[data-theme]")
    .first()
    .evaluate((n, theme) => n.setAttribute("data-theme", theme), theme);
  if (viewport) await page.setViewportSize(viewport);
}
