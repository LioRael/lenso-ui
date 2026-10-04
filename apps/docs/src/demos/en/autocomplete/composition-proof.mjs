/**
 * Popup mounts alone don't detect the former unpadded search chrome or small,
 * square chips. Prove source-derived geometry alongside native keyboard actions.
 * The host supplies Default/MultipleSelect navigation and optional captures.
 */
import assert from "node:assert/strict";

export async function proveAutocompleteComposition(page, openDemo, capture = async () => {}) {
  const results = [];
  const errors = [];
  const onError = (error) => errors.push(error.message);
  page.on("pageerror", onError);
  try {
    for (const width of [1280, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["light", "dark"]) {
        for (const direction of ["ltr", "rtl"]) {
          for (const name of ["default", "multiple-select"]) {
            await openDemo(name, theme, direction);
            const label = name === "default" ? "States to Visit" : "States";
            const trigger = page.getByRole("combobox", { name: label, exact: true });
            await trigger.focus();
            await page.keyboard.press("ArrowDown");
            const search = page.getByRole("combobox", { name: "Search options", exact: true });
            await search.waitFor();
            assert(await search.evaluate((element) => element === document.activeElement));
            await page.waitForFunction(
              (input) =>
                getComputedStyle(input.closest('[data-slot="autocomplete-popover"]')).transform ===
                "matrix(1, 0, 0, 1, 0, 0)",
              await search.elementHandle(),
            );
            const geometry = await search.evaluate((input) => {
              const group = input.parentElement;
              const outer = group.parentElement;
              const popup = outer.parentElement;
              const css = getComputedStyle(group);
              const outerCss = getComputedStyle(outer);
              const sample = input.ownerDocument.createElement("span");
              sample.style.backgroundColor = "var(--default)";
              group.append(sample);
              const expectedBackground = getComputedStyle(sample).backgroundColor;
              sample.remove();
              return {
                outerInline: outerCss.paddingInlineStart,
                outerBlock: outerCss.paddingTop,
                groupHeight: group.getBoundingClientRect().height,
                inset: group.getBoundingClientRect().left - popup.getBoundingClientRect().left,
                background: css.backgroundColor,
                expectedBackground,
                shadow: css.boxShadow,
                iconWidth: group.querySelector("svg").getBoundingClientRect().width,
                iconMargin: getComputedStyle(group.querySelector("svg")).marginInlineStart,
                inputPadding: getComputedStyle(input).paddingInlineStart,
              };
            });
            assert.equal(geometry.outerInline, "12px");
            assert.equal(geometry.outerBlock, "4px");
            assert.equal(geometry.groupHeight, 36);
            assert.equal(geometry.inset, 12);
            assert.equal(geometry.background, geometry.expectedBackground);
            assert.equal(geometry.shadow, "none");
            assert.equal(geometry.iconWidth, 16);
            assert.equal(geometry.iconMargin, "12px");
            assert.equal(geometry.inputPadding, "8px");
            const empty = page.getByRole("status");
            assert.equal(await empty.getAttribute("aria-live"), "polite");
            assert.equal(await empty.getAttribute("aria-atomic"), "true");
            assert.equal(await empty.getAttribute("aria-hidden"), null);
            assert.equal(await empty.getAttribute("hidden"), null);
            assert.notEqual(await empty.evaluate((node) => getComputedStyle(node).display), "none");
            assert.equal(await empty.evaluate((node) => node.getBoundingClientRect().height), 0);
            const firstRowGap = await page
              .getByRole("option")
              .first()
              .evaluate(
                (option, input) =>
                  option.getBoundingClientRect().top -
                  input.parentElement.parentElement.getBoundingClientRect().bottom,
                await search.elementHandle(),
              );
            assert.equal(firstRowGap, 6);
            await capture(`${name}-${theme}-${width}-${direction}-open`);
            await search.fill("zzzz");
            await page.getByText("No results found", { exact: true }).waitFor();
            assert.equal(await page.getByRole("option").count(), 0);
            assert.equal(await empty.evaluate((node) => getComputedStyle(node).paddingTop), "12px");
            assert.equal(
              await empty.evaluate((node) => getComputedStyle(node).paddingBottom),
              "12px",
            );
            assert((await empty.evaluate((node) => node.getBoundingClientRect().height)) > 24);
            await search.fill("tex");
            await page.getByRole("option", { name: "Texas", exact: true }).waitFor();
            assert.equal(await empty.evaluate((node) => node.getBoundingClientRect().height), 0);
            assert.equal(await page.getByRole("option").count(), 1);
            await page.getByRole("button", { name: "Clear search", exact: true }).click();
            assert.equal(await search.inputValue(), "");
            assert(await search.evaluate((element) => element === document.activeElement));
            await search.fill("tex");
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("Enter");
            await search.fill("cal");
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("Enter");
            await page.keyboard.press("Escape");
            await page.getByRole("listbox").waitFor({ state: "hidden" });
            assert(await trigger.evaluate((element) => element === document.activeElement));
            assert.equal(await page.getByRole("button", { name: /^Remove / }).count(), 2);
            const tags = await page
              .getByRole("button", { name: "Remove Texas", exact: true })
              .evaluate((remove) => {
                const tag = remove.parentElement;
                const css = getComputedStyle(tag);
                return {
                  padding: css.paddingInlineStart,
                  block: css.paddingTop,
                  radius: css.borderTopLeftRadius,
                  height: tag.getBoundingClientRect().height,
                  weight: css.fontWeight,
                  gap: getComputedStyle(tag.parentElement).gap,
                  removeWidth: remove.getBoundingClientRect().width,
                  targetWidth: getComputedStyle(remove, "::after").width,
                  targetHeight: getComputedStyle(remove, "::after").height,
                };
              });
            assert.equal(tags.padding, "8px");
            assert.equal(tags.block, "2px");
            assert.equal(tags.height, 20);
            assert.equal(tags.radius, "12px");
            assert.equal(tags.weight, "500");
            assert.equal(tags.gap, "6px");
            assert.equal(tags.removeWidth, 12);
            assert.equal(tags.targetWidth, "24px");
            assert.equal(tags.targetHeight, "24px");
            assert.equal(await page.locator("button button").count(), 0);
            const field = await page.getByRole("group", { name: label, exact: true }).boundingBox();
            assert.equal(field.width, 256);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            await capture(`${name}-${theme}-${width}-${direction}-tags`);
            await page.getByRole("button", { name: "Remove Texas", exact: true }).focus();
            await page.keyboard.press("Enter");
            assert.equal(await page.getByRole("button", { name: /^Remove / }).count(), 1);
            if (name === "multiple-select") {
              await page.getByRole("button", { name: "Clear States", exact: true }).focus();
              await page.keyboard.press("Enter");
              assert.equal(await page.getByRole("button", { name: /^Remove / }).count(), 0);
              assert.match(await trigger.innerText(), /Select states/);
            }
            results.push({ name, theme, width, direction, geometry, firstRowGap, tags });
          }
        }
      }
    }
    assert.deepEqual(errors, []);
    return results;
  } finally {
    page.off("pageerror", onError);
  }
}
