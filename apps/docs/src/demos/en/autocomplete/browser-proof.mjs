/**
 * Behavioral proof for the 24 archived Autocomplete scenarios.
 * The caller supplies a Chromium page and navigation to its built demo host.
 * These checks cover failures mounting alone cannot detect: stale async responses,
 * chip/value divergence, invalid field associations and offscreen keyboard items.
 */
import assert from "node:assert/strict";

export const autocompleteScenarios = [
  "allows-empty-collection",
  "asynchronous-filtering",
  "controlled-multiple",
  "controlled-open-state",
  "controlled",
  "custom-indicator",
  "custom-styles",
  "custom-value",
  "default",
  "disabled",
  "email-recipients",
  "full-width",
  "location-search",
  "multiple-select",
  "on-surface",
  "required",
  "tag-group-selection",
  "user-selection-multiple",
  "user-selection",
  "variants",
  "virtualization",
  "with-description",
  "with-disabled-options",
  "with-sections",
];

export async function proveAutocomplete(page, openDemo) {
  const errors = [];
  const onError = (error) => errors.push(error.message);
  page.on("pageerror", onError);
  const routeCharacters = async (route) => {
    const query = new URL(route.request().url()).searchParams.get("search");
    await new Promise((resolve) => setTimeout(resolve, query === "slow" ? 300 : 30));
    await route.fulfill({
      json: {
        results: [
          {
            name:
              query === "luke"
                ? "Luke Skywalker"
                : query === "slow"
                  ? "Slow result"
                  : "Leia Organa",
          },
        ],
      },
    });
  };
  await page.route("https://swapi.py4e.com/**", routeCharacters);
  const go = async (name) => {
    await openDemo(name);
    await page.getByRole("combobox").first().waitFor();
  };
  const search = (name) => page.getByRole("combobox", { name, exact: true });
  const option = (name) => page.getByRole("option", { name, exact: true });
  try {
    for (const name of autocompleteScenarios) {
      await go(name);
      assert((await page.getByRole("combobox").count()) > 0, `${name} did not mount`);
    }

    await go("default");
    await search("States to Visit").click();
    await search("Search options").fill("tex");
    await option("Texas").waitFor();
    assert.equal(await page.getByRole("option").count(), 1);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Remove Texas", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: "Remove Texas", exact: true }).count(), 0);

    await go("custom-value");
    assert.match(await search("Currency").innerText(), /\$\s*USD\s*US Dollar/);
    await search("Currency").click();
    await search("Search currencies").fill("GBP");
    await page.getByRole("option", { name: /British Pound/ }).waitFor();
    assert.equal(await page.getByRole("option").count(), 1);
    await page.getByRole("option", { name: /British Pound/ }).click();
    assert.match(await search("Currency").innerText(), /£\s*GBP\s*British Pound/);

    await go("custom-styles");
    await search("Assignees").click();
    await search("Search by name or role").fill("Engineering");
    await page.getByRole("option", { name: /Marcus Lee/ }).waitFor();
    assert.equal(await page.getByRole("option").count(), 1);
    await page.getByRole("button", { name: "Clear search", exact: true }).click();
    assert.equal(await search("Search by name or role").inputValue(), "");
    assert(
      await search("Search by name or role").evaluate(
        (element) => element === document.activeElement,
      ),
    );

    await go("disabled");
    const disabledTriggers = await page.getByRole("combobox").all();
    assert.equal(disabledTriggers.length, 2);
    for (const trigger of disabledTriggers) assert(await trigger.isDisabled());

    await go("controlled");
    assert.match(await page.locator("body").innerText(), /Selected: California/);
    await search("State (controlled)").click();
    await option("Texas").click();
    assert.match(await page.locator("body").innerText(), /Selected: Texas/);

    await go("controlled-multiple");
    await search("States").click();
    await option("Florida").click();
    assert.match(await page.locator("body").innerText(), /california, texas, florida/);
    await page.keyboard.press("Escape");

    await go("email-recipients");
    await search("To").click();
    await page.getByRole("option", { name: /Alice Johnson/ }).click();
    await page.getByRole("option", { name: /Bob Smith/ }).click();
    const recipientField = await page.getByRole("group", { name: "To", exact: true }).boundingBox();
    const recipientPopup = await page.locator("[data-slot=autocomplete-popover]").boundingBox();
    assert(recipientField && recipientPopup);
    assert(Math.abs(recipientField.width - recipientPopup.width) <= 1);
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("button", { name: /^Remove / }).count(), 2);
    await page.getByRole("button", { name: "Remove Alice Johnson", exact: true }).click();
    assert.equal(await page.getByRole("button", { name: /^Remove / }).count(), 1);
    assert.match(await page.locator("body").innerText(), /bob@example.com/);
    assert.equal(await page.locator("button button").count(), 0);

    await go("tag-group-selection");
    await search("Tags").click();
    await option("React").click();
    await option("TypeScript").click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Remove React", exact: true }).focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.getByRole("button", { name: "Remove React", exact: true }).count(), 0);

    await go("controlled-open-state");
    await page.getByRole("button", { name: "Open Autocomplete", exact: true }).click();
    await option("Florida").waitFor();
    await page.keyboard.press("Escape");
    assert.match(await page.locator("body").innerText(), /Autocomplete is closed/);

    await go("required");
    await page.getByRole("button", { name: "Submit", exact: true }).click();
    assert.equal(await page.locator("[aria-invalid=true]").count(), 2);
    const stateField = search("State *");
    await page.waitForFunction(
      () => document.activeElement?.getAttribute("aria-invalid") === "true",
    );
    assert(await stateField.evaluate((element) => element === document.activeElement));
    const descriptionId = await stateField.getAttribute("aria-describedby");
    assert(descriptionId);
    assert.equal(
      await page.evaluate((id) => document.getElementById(id)?.textContent, descriptionId),
      "Please select a state.",
    );
    await stateField.click();
    await option("Texas").click();
    assert.equal(await page.locator("[aria-invalid=true]").count(), 1);
    assert.equal(await page.locator("input[name=state]").inputValue(), "texas");
    await search("Country *").click();
    await option("France").click();
    assert.equal(await page.locator("input[name=country]").inputValue(), "france");
    assert.equal(await page.locator("[aria-invalid=true]").count(), 0);
    const dialog = page.waitForEvent("dialog");
    const submitClick = page.getByRole("button", { name: "Submit", exact: true }).click();
    const submittedDialog = await dialog;
    assert.equal(submittedDialog.message(), "Form submitted successfully!");
    await submittedDialog.dismiss();
    await submitClick;

    await go("asynchronous-filtering");
    await page.getByRole("combobox").click();
    await search("Search characters").fill("slow");
    await search("Search characters").fill("luke");
    await option("Luke Skywalker").waitFor();
    await page.waitForTimeout(350);
    assert.equal(await option("Slow result").count(), 0);

    await go("location-search");
    await search("City").click();
    await search("Search cities").fill("Tokyo");
    await page.getByRole("option", { name: /Tokyo/ }).waitFor();
    assert.equal(await page.getByRole("option").count(), 1);

    await go("with-disabled-options");
    await search("Animal").click();
    assert.equal(await option("Cat").getAttribute("aria-disabled"), "true");

    await go("with-sections");
    await search("Country").click();
    await page.getByRole("group", { name: "North America", exact: true }).waitFor();
    assert.equal(await page.getByRole("listbox").getByRole("group").count(), 3);
    await search("Search countries").fill("Korea");
    await option("South Korea").waitFor();
    assert.equal(await page.getByRole("option").count(), 1);

    await go("virtualization");
    await search("User").click();
    await page.getByRole("option").first().waitFor();
    assert((await page.getByRole("option").count()) <= 14);
    await page.getByRole("listbox").evaluate((element) => {
      element.scrollTop = 25000;
      element.dispatchEvent(new Event("scroll", { bubbles: true }));
    });
    await page.waitForTimeout(100);
    const positions = await page
      .getByRole("option")
      .evaluateAll((elements) =>
        elements.map((element) => Number(element.getAttribute("aria-posinset"))),
      );
    assert(Math.min(...positions) > 400);
    await search("Search users").focus();
    for (let index = 0; index < 35; index++) await page.keyboard.press("ArrowDown");
    const active = await search("Search users").getAttribute("aria-activedescendant");
    assert(active);
    assert(await page.evaluate((id) => !!document.getElementById(id), active));
    await search("Search users").fill("Emma Smith");
    await page.getByRole("option").first().waitFor();
    assert((await page.getByRole("option").count()) <= 14);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    assert.match(await search("User").innerText(), /Emma Smith/);

    assert.deepEqual(errors, []);
    return { mounted: autocompleteScenarios.length, runtimeErrors: errors };
  } finally {
    page.off("pageerror", onError);
    await page.unroute("https://swapi.py4e.com/**", routeCharacters);
  }
}

export async function proveAutocompleteGeometry(page, openDemo) {
  let mounted = 0;
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      for (const name of autocompleteScenarios) {
        await openDemo(name);
        await page.evaluate((nextTheme) => {
          document.documentElement.className = nextTheme;
          document.documentElement.setAttribute("data-theme", nextTheme);
        }, theme);
        const trigger = page.getByRole("combobox").first();
        await trigger.waitFor();
        assert(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${name} overflows at ${width}px in ${theme}`,
        );
        mounted++;
        if (await trigger.isDisabled()) continue;
        await trigger.click();
        const popup = page.locator("[data-slot=autocomplete-popover]");
        await popup.waitFor();
        const box = await popup.boundingBox();
        assert(box && box.width > 100 && box.x >= -1 && box.x + box.width <= width + 1);
        if (name === "email-recipients") {
          await page.getByRole("option", { name: /Alice Johnson/ }).click();
          await page.getByRole("option", { name: /Bob Smith/ }).click();
          const populatedBox = await popup.boundingBox();
          assert(populatedBox && populatedBox.width > 250);
          await page.keyboard.press("Escape");
          await popup.waitFor({ state: "hidden" });
          assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        }
      }
    }
  }
  return { mounted, themes: ["light", "dark"], widths: [390, 1280] };
}
