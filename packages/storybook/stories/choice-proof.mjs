/**
 * Scoped production-iframe proof. Existing smoke checks cover development
 * states, not pinned forms, select-all, per-item names or custom/card geometry.
 * Build and serve Storybook, then set LENSO_CHOICE_URL and run this file.
 * PLAYWRIGHT_MODULE optionally points to an existing readonly dependency.
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
const require = createRequire(new URL("../../testing/package.json", import.meta.url));
const { chromium } = await import(
  process.env["PLAYWRIGHT_MODULE"] ?? require.resolve("playwright")
);
const base = process.env["LENSO_CHOICE_URL"] ?? "http://127.0.0.1:6006";
const families = ["checkbox", "checkbox-group", "radio-group", "switch", "switch-group", "slider"];
const pin = "e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
async function story(family, name, theme = "light") {
  await page.goto(
    `${base}/iframe.html?id=components-${family.replaceAll("-", "")}--${kebab(name)}&viewMode=story&globals=theme:${theme}`,
  );
  await page
    .locator("#storybook-root > *")
    .first()
    .waitFor({ state: "attached" })
    .catch(async (error) => {
      throw new Error(
        `${family}/${name}/${theme}: ${await page.locator("#error-message").textContent()}`,
        { cause: error },
      );
    });
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.theme ===
      new URL(location.href).searchParams.get("globals")?.split(":")[1],
  );
  assert.equal(await page.locator("#error-message").textContent(), "");
}
async function checked(locator, value) {
  assert.equal(await locator.getAttribute("aria-checked"), String(value));
}
try {
  let mounts = 0;
  for (const family of families) {
    const response = await fetch(
      `https://raw.githubusercontent.com/heroui-inc/heroui/${pin}/packages/react/src/components/${family}/${family}.stories.tsx`,
    );
    assert.equal(response.status, 200);
    const upstream = [...(await response.text()).matchAll(/export const (\w+): Story/g)].map(
      (match) => match[1],
    );
    const source = await readFile(new URL(`./${family}.stories.tsx`, import.meta.url), "utf8");
    const local = [...source.matchAll(/export const (\w+): Story/g)]
      .map((match) => match[1])
      .filter((name) => !name.startsWith("Local"));
    assert.deepEqual(local, upstream, `${family}: exact case-sensitive source exports`);
    for (const theme of ["light", "dark"]) {
      for (const name of upstream) {
        await story(family, name, theme);
        const geometry = await page.locator("#storybook-root").boundingBox();
        assert.ok(
          geometry && geometry.width > 0 && geometry.height > 0,
          `${family}/${name}/${theme} visible geometry`,
        );
        mounts++;
      }
    }
  }
  assert.equal(mounts, 100);
  for (const theme of ["light", "dark"]) {
    await story("checkbox", "Default", theme);
    let control = page.getByRole("checkbox", { name: "Accept terms and conditions", exact: true });
    await checked(control, false);
    await control.click();
    await checked(control, true);
    await control.focus();
    await page.keyboard.press("Space");
    await checked(control, false);
    await story("checkbox", "Controlled", theme);
    control = page.getByRole("checkbox", { name: "Email notifications", exact: true });
    await checked(control, true);
    await control.click();
    await checked(control, false);
    assert.match(await page.locator("#storybook-root").innerText(), /Status: Disabled/);
    await story("checkbox", "Disabled", theme);
    control = page.getByRole("checkbox", { name: "Feature", exact: true });
    await control.click({ force: true });
    await checked(control, false);
    await story("checkbox-group", "Indeterminate", theme);
    const all = page.getByRole("checkbox", { name: "Select all", exact: true });
    await checked(all, "mixed");
    await all.click();
    await checked(all, true);
    for (const name of ["Coding", "Design", "Writing"])
      await checked(page.getByRole("checkbox", { name, exact: true }), true);
    await all.click();
    for (const name of ["Select all", "Coding", "Design", "Writing"])
      await checked(page.getByRole("checkbox", { name, exact: true }), false);
    await story("checkbox-group", "Default", theme);
    assert.equal(
      (await page
        .getByRole("checkbox", { name: "Coding", exact: true })
        .getAttribute("aria-describedby")) !== null,
      true,
    );
    await story("switch", "Default", theme);
    control = page.getByRole("switch", { name: "Enable notifications", exact: true });
    await control.click();
    await checked(control, true);
    await control.focus();
    await page.keyboard.press("Space");
    await checked(control, false);
    await story("switch", "Controlled", theme);
    control = page.getByRole("switch", { name: "Enable notifications", exact: true });
    await control.click();
    assert.match(await page.locator("#storybook-root").innerText(), /Switch is on/);
    await story("switch", "DisabledDefaultSelected", theme);
    control = page.getByRole("switch", { name: "Enable notifications", exact: true });
    await control.click({ force: true });
    await checked(control, true);
    for (const [family, error] of [
      ["checkbox", "You must accept the terms to continue"],
      ["switch", "You must enable notifications to continue"],
    ]) {
      await story(family, "Invalid", theme);
      assert.equal(await page.getByText(error, { exact: true }).isVisible(), true);
      assert.equal(
        await page
          .getByRole(family === "checkbox" ? "checkbox" : "switch")
          .getAttribute("aria-invalid"),
        "true",
      );
    }
    for (const [family, name, error] of [
      ["checkbox", "Subscribe to newsletter", "Please subscribe to continue"],
      ["switch", "Accept terms", "You must accept to continue"],
    ]) {
      await story(family, "Validation", theme);
      control = page.getByRole(family === "checkbox" ? "checkbox" : "switch", {
        name,
        exact: true,
      });
      await control.click();
      await control.click();
      await page.keyboard.press("Tab");
      await page.getByText(error, { exact: true }).waitFor({ state: "visible" });
      await control.click();
      await page.keyboard.press("Tab");
      await page.getByText(error, { exact: true }).waitFor({ state: "hidden" });
    }
    for (const [family, error, item, expected] of [
      [
        "checkbox-group",
        "Please select at least one notification method.",
        "SMS notifications",
        "Selected preferences: sms",
      ],
      [
        "radio-group",
        "Choose a subscription before continuing.",
        "Pro",
        "Your chosen plan is: pro",
      ],
    ]) {
      await story(family, "Validation", theme);
      await page.getByRole("button", { name: "Submit", exact: true }).click();
      await page.getByText(error, { exact: true }).waitFor({ state: "visible" });
      await page
        .getByRole(family === "checkbox-group" ? "checkbox" : "radio", { name: item, exact: true })
        .click();
      const dialogPromise = page.waitForEvent("dialog").then(async (dialog) => {
        assert.equal(dialog.message(), expected);
        await dialog.dismiss();
      });
      await Promise.all([
        dialogPromise,
        page.getByRole("button", { name: "Submit", exact: true }).click(),
      ]);
    }
    await story("switch-group", "Form", theme);
    await page.getByRole("switch", { name: "Enable notifications", exact: true }).click();
    const formData = await page
      .locator("form")
      .evaluate((form) => [...new FormData(form).entries()]);
    assert.deepEqual(formData, [
      ["notifications", "on"],
      ["newsletter", "on"],
    ]);
    await story("radio-group", "Default", theme);
    const radioGeometry = await page
      .getByRole("radio")
      .first()
      .evaluate((element) => {
        const content = element.querySelector("[data-slot=radio-content]");
        const control = element.querySelector("[data-slot=radio-control]");
        const help = element.querySelector("[aria-describedby]") ?? element.lastElementChild;
        const contentStyle = getComputedStyle(content);
        const helpStyle = getComputedStyle(help);
        return {
          control: [control.getBoundingClientRect().width, control.getBoundingClientRect().height],
          gap: contentStyle.columnGap,
          label: [contentStyle.fontSize, contentStyle.fontWeight],
          description: [helpStyle.fontSize, helpStyle.paddingInlineStart],
          margin: getComputedStyle(element).marginBlockStart,
        };
      });
    assert.deepEqual(radioGeometry, {
      control: [16, 16],
      gap: "12px",
      label: ["14px", "500"],
      description: ["12px", "28px"],
      margin: "16px",
    });
    await story("radio-group", "Variants", theme);
    const primarySelected = page
      .getByRole("radiogroup")
      .first()
      .locator("[data-checked] [data-slot=radio-control]");
    const secondary = page.getByRole("radiogroup").nth(1);
    const secondarySelected = secondary.locator("[data-checked] [data-slot=radio-control]");
    assert.equal(
      await secondarySelected.evaluate((element) => getComputedStyle(element).backgroundColor),
      await primarySelected.evaluate((element) => getComputedStyle(element).backgroundColor),
      "secondary selection retains the primary accent fill",
    );
    const secondaryUnselected = secondary.getByRole("radio", { name: "Option 2", exact: true });
    const secondaryIndicator = secondaryUnselected.locator("[data-slot=radio-indicator]");
    await page.mouse.move(0, 0);
    await page.waitForTimeout(250);
    const beforeHover = await secondaryIndicator.evaluate(
      (element) => getComputedStyle(element, "::before").backgroundColor,
    );
    await secondaryUnselected.hover();
    await page.waitForTimeout(250);
    assert.notEqual(
      await secondaryIndicator.evaluate(
        (element) => getComputedStyle(element, "::before").backgroundColor,
      ),
      beforeHover,
      "secondary unselected indicator supplies hover feedback",
    );
    await secondaryUnselected.click();
    await page.waitForTimeout(250);
    assert.equal(
      await secondaryUnselected
        .locator("[data-slot=radio-control]")
        .evaluate((element) => getComputedStyle(element).backgroundColor),
      await primarySelected.evaluate((element) => getComputedStyle(element).backgroundColor),
      "secondary remains accent-filled after selection",
    );
    await story("radio-group", "PerRadioInvalid", theme);
    const invalidRadio = page.getByRole("radio", { name: "Basic Plan", exact: true });
    assert.deepEqual(
      await invalidRadio.locator("[data-slot=radio-control]").evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.outlineStyle, style.outlineWidth];
      }),
      ["solid", "1px"],
    );
    await story("radio-group", "Orientation", theme);
    assert.deepEqual(
      await page.getByRole("radiogroup").evaluate((element) => {
        const style = getComputedStyle(element);
        return [style.flexDirection, style.columnGap];
      }),
      ["row", "16px"],
    );
    await story("radio-group", "Controlled", theme);
    control = page.getByRole("radio", { name: "Pro", exact: true });
    await control.focus();
    await page.keyboard.press("ArrowDown");
    await checked(page.getByRole("radio", { name: "Teams", exact: true }), true);
    assert.match(await page.locator("#storybook-root").innerText(), /Selected plan: teams/);
    await story("radio-group", "Uncontrolled", theme);
    await page.getByRole("radio", { name: "Starter", exact: true }).click();
    assert.match(await page.locator("#storybook-root").innerText(), /Last chosen plan: starter/);
    await story("radio-group", "Disabled", theme);
    await page.getByRole("radio", { name: "Starter", exact: true }).click({ force: true });
    await checked(page.getByRole("radio", { name: "Pro", exact: true }), true);
    await story("slider", "Default", theme);
    control = page.getByRole("slider", { name: "Volume", exact: true });
    await control.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await control.getAttribute("aria-valuenow"), "31");
    await page.keyboard.press("Home");
    assert.equal(await control.getAttribute("aria-valuenow"), "0");
    await page.keyboard.press("End");
    assert.equal(await control.getAttribute("aria-valuenow"), "100");
    await story("slider", "Vertical", theme);
    control = page.getByRole("slider", { name: "Volume", exact: true });
    await control.focus();
    await page.keyboard.press("ArrowUp");
    assert.equal(await control.getAttribute("aria-valuenow"), "31");
    const track = await page.locator("[data-slot=slider-track]").boundingBox();
    assert.ok(track && track.height > 100 && track.width < 40);
    await story("slider", "Range", theme);
    control = page.getByRole("slider", { name: "Minimum price", exact: true });
    await control.focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await control.getAttribute("aria-valuenow"), "150");
    assert.equal(
      await page
        .getByRole("slider", { name: "Maximum price", exact: true })
        .getAttribute("aria-valuenow"),
      "500",
    );
    assert.match(await page.locator("output").innerText(), /\$150\.00/);
    await story("slider", "Disabled", theme);
    control = page.getByRole("slider", { name: "Volume", exact: true });
    await control.press("ArrowRight");
    assert.equal(await control.getAttribute("aria-valuenow"), "30");
    await story("radio-group", "WithCustomIndicator", theme);
    assert.equal(
      await page.locator("[data-slot=radio-indicator]").getByText("✓", { exact: true }).count(),
      1,
    );
    await page.getByRole("radio", { name: "Basic Plan", exact: true }).click();
    assert.equal(
      await page.locator("[data-slot=radio-indicator]").getByText("✓", { exact: true }).count(),
      1,
    );
    await story("switch", "WithCustomStyles", theme);
    const switchControl = page.locator("[data-slot=switch-control]");
    const customGeometry = await switchControl.boundingBox();
    assert.equal(customGeometry.width, 51);
    assert.equal(customGeometry.height, 31);
    assert.equal(
      await switchControl.evaluate((element) => getComputedStyle(element).backgroundColor),
      "rgb(59, 130, 246)",
    );
    await page.getByRole("switch", { name: "Power", exact: true }).click();
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("[data-slot=switch-control]")).backgroundColor ===
        "rgb(6, 182, 212)",
    );
    await page.waitForFunction(
      () =>
        getComputedStyle(document.querySelector("[data-slot=switch-thumb]")).marginInlineStart ===
        "22px",
    );
    const thumbBox = await page.locator("[data-slot=switch-thumb]").boundingBox();
    assert.equal(thumbBox.width, 27);
    assert.equal(thumbBox.height, 27);
    await story("checkbox", "FullRounded", theme);
    const sizes = await page
      .locator("[data-slot=checkbox-control]")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
    assert.deepEqual(sizes, [12, 16, 20, 24]);
    const checkmarks = await page
      .locator("[data-slot=checkbox-indicator] svg:first-child")
      .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().width));
    assert.deepEqual(checkmarks, [8, 10, 10, 16]);
    await story("radio-group", "DeliveryAndPaymentExample", theme);
    assert.equal(await page.getByRole("radio").count(), 6);
    const cards = await page.locator("[data-slot=radio-content]").evaluateAll((elements) =>
      elements.map((element) => ({
        width: element.getBoundingClientRect().width,
        background: getComputedStyle(element).backgroundColor,
      })),
    );
    assert.ok(cards.every((card) => card.width > 100));
    assert.notEqual(cards[0].background, cards[1].background);
    if (process.env["LENSO_CHOICE_SCREENSHOTS"]) {
      await page.screenshot({
        path: `${process.env["LENSO_CHOICE_SCREENSHOTS"]}/choice-cards-${theme}.png`,
      });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await story("radio-group", "DeliveryAndPaymentExample", theme);
    const mobileCards = await page
      .locator("[data-slot=radio-content]")
      .evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().toJSON()),
      );
    assert.ok(mobileCards.every((card) => card.width > 200 && card.x >= 0 && card.right <= 390));
    assert.ok(mobileCards[1].y > mobileCards[0].y);
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await page
        .locator("[data-slot=radio-content]")
        .first()
        .evaluate((element) => getComputedStyle(element).transitionDuration),
      "0s",
    );
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width: 1000, height: 800 });
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      sourceExports: 50,
      bothThemeMounts: 100,
      themes: ["light", "dark"],
      interactions: "passed",
      geometry: "passed",
      errors,
    }),
  );
} finally {
  await browser.close();
}
