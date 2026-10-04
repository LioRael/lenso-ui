/**
 * HeroUI v3.2.6 Autocomplete geometry and native Base UI regression proof.
 * SPDX-License-Identifier: Apache-2.0
 */
import * as React from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Autocomplete } from "./index.js";
import { Field } from "@base-ui/react/field";
import { ThemeScope } from "../../utils/theme-scope.js";
import Default from "../../../../../apps/docs/src/demos/en/autocomplete/default";
import { autocompleteTestStyles } from "../../../../styles/src/components/autocomplete/autocomplete.test-styles.js";

const items = ["Florida", "Delaware", "California", "Texas", "New York", "Washington"];

function Options() {
  return (
    <Autocomplete.Portal>
      <Autocomplete.Positioner sideOffset={4}>
        <Autocomplete.Popover>
          <Autocomplete.Input aria-label="Search states" placeholder="Search..." />
          <Autocomplete.Empty>No states</Autocomplete.Empty>
          <Autocomplete.List>
            {(item: string) => (
              <Autocomplete.Item value={item} key={item} disabled={item === "Delaware"}>
                {item}
                <Autocomplete.ItemIndicator />
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Popover>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>
  );
}

// No previous Autocomplete test proved the Value's own DOM, popup typography,
// row pitch, or the pinned list's 4px spacing at desktop and phone widths.
test.each(["light", "dark"] as const)(
  "source geometry, portalled paint and native popup search in %s",
  async (theme) => {
    const screen = await render(
      <ThemeScope theme={theme} style={{ width: 256 }}>
        <Autocomplete items={items} fullWidth>
          <Autocomplete.Trigger aria-label="State">
            <Autocomplete.Value placeholder="Select a state" />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Options />
        </Autocomplete>
        <span data-testid="placeholder-probe" style={{ color: "var(--field-placeholder)" }} />
        <span
          data-testid="overlay-probe"
          style={{ backgroundColor: "var(--overlay)", color: "var(--overlay-foreground)" }}
        />
      </ThemeScope>,
    );
    const trigger = screen.getByRole("combobox", { name: "State" }).element();
    const value = trigger.querySelector<HTMLElement>('[data-slot="autocomplete-value"]')!;
    expect(trigger.getBoundingClientRect().height).toBe(36);
    expect(value).not.toBeNull();
    expect(value.getBoundingClientRect().left - trigger.getBoundingClientRect().left).toBe(12);
    expect(getComputedStyle(value).fontSize).toBe("14px");
    expect(getComputedStyle(value).color).toBe(
      getComputedStyle(screen.getByTestId("placeholder-probe").element()).color,
    );
    await screen.getByRole("combobox", { name: "State" }).click();
    const input = screen.getByRole("combobox", { name: "Search states" }).element();
    const list = screen.getByRole("listbox").element();
    const popup = list.parentElement!;
    await expect.poll(() => Math.round(popup.getBoundingClientRect().width)).toBe(256);
    await expect.poll(() => getComputedStyle(popup).transform).toBe("matrix(1, 0, 0, 1, 0, 0)");
    expect(getComputedStyle(popup).backgroundColor).toBe(
      getComputedStyle(screen.getByTestId("overlay-probe").element()).backgroundColor,
    );
    expect(getComputedStyle(popup).fontSize).toBe("14px");
    expect(input.getBoundingClientRect().height).toBe(36);
    expect(getComputedStyle(list).paddingTop).toBe("6px");
    const rows = screen.getByRole("option").elements();
    expect(rows[0]!.getBoundingClientRect().height).toBe(36);
    expect(rows[1]!.getBoundingClientRect().top - rows[0]!.getBoundingClientRect().bottom).toBe(4);
    expect(getComputedStyle(rows[1]!).opacity).toBe("0.5");
    await expect.poll(() => document.activeElement).toBe(input);
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(screen.getByRole("option", { name: "Florida" }))
      .toHaveAttribute("data-highlighted");
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(screen.getByRole("option", { name: "Delaware" }))
      .toHaveAttribute("data-highlighted");
    await userEvent.keyboard("{Enter}");
    expect(trigger.textContent).toContain("Select a state");
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(screen.getByRole("option", { name: "California" }))
      .toHaveAttribute("data-highlighted");
    await userEvent.keyboard("{Enter}");
    await expect
      .element(screen.getByRole("combobox", { name: "State", exact: true }))
      .toHaveTextContent("California");
    await expect.poll(() => document.activeElement).toBe(trigger);
    expect(getComputedStyle(value).color).toBe(getComputedStyle(trigger).color);
    await page.viewport(390, 844);
    try {
      expect(getComputedStyle(value).fontSize).toBe("16px");
      expect(trigger.getBoundingClientRect().height).toBe(40);
      await screen.getByRole("combobox", { name: "State" }).click();
      await screen.getByRole("combobox", { name: "Search states" }).fill("Wash");
      await expect.element(screen.getByRole("option", { name: "Washington" })).toBeVisible();
      expect(screen.getByRole("option", { name: "Florida" }).query()).toBeNull();
      await userEvent.keyboard("{Escape}");
      await expect.poll(() => document.activeElement).toBe(trigger);
    } finally {
      await page.viewport(1280, 900);
    }
  },
);

test("secondary focus, invalid and disabled paint retain native state and render/ref callbacks", async () => {
  const ref = React.createRef<HTMLButtonElement>();
  const openChange = vi.fn();
  const screen = await render(
    <>
      <Field.Root invalid>
        <Autocomplete items={items} variant="secondary" onOpenChange={openChange}>
          <Autocomplete.Trigger
            ref={ref}
            aria-label="Invalid state"
            style={({ open }) => ({ letterSpacing: open ? 2 : 1 })}
            render={(props, state) => <button {...props} data-native-open={String(state.open)} />}
          >
            <Autocomplete.Value placeholder="Pick" />
            <Autocomplete.Indicator />
          </Autocomplete.Trigger>
          <Options />
        </Autocomplete>
      </Field.Root>
      <Autocomplete disabled>
        <Autocomplete.Trigger aria-label="Disabled state">Pick</Autocomplete.Trigger>
      </Autocomplete>
      <span data-testid="danger" style={{ borderColor: "var(--danger)" }} />
      <span data-testid="secondary" style={{ backgroundColor: "var(--default)" }} />
    </>,
  );
  const trigger = screen.getByRole("combobox", { name: "Invalid state" }).element();
  expect(ref.current).toBe(trigger);
  await expect
    .element(screen.getByRole("combobox", { name: "Invalid state" }))
    .toHaveAttribute("aria-invalid", "true");
  await screen.getByRole("combobox", { name: "Invalid state" }).hover();
  await expect
    .poll(() => getComputedStyle(trigger).borderTopColor)
    .toBe(getComputedStyle(screen.getByTestId("danger").element()).borderTopColor);
  await expect
    .poll(() => getComputedStyle(trigger).backgroundColor)
    .toBe(getComputedStyle(screen.getByTestId("secondary").element()).backgroundColor);
  expect(getComputedStyle(trigger).boxShadow).toBe("none");
  await screen.getByRole("combobox", { name: "Invalid state" }).click();
  expect(trigger.getAttribute("data-native-open")).toBe("true");
  expect(getComputedStyle(trigger).letterSpacing).toBe("2px");
  expect(openChange).toHaveBeenCalledWith(true, expect.anything());
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => getComputedStyle(trigger).outlineWidth).toBe("2px");
  await expect.element(screen.getByRole("combobox", { name: "Disabled state" })).toBeDisabled();
  expect(
    getComputedStyle(screen.getByRole("combobox", { name: "Disabled state" }).element()).opacity,
  ).toBe("0.5");
});

test("live docs adaptation retains source row geometry and RTL logical indicator alignment", async () => {
  const screen = await render(
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <Default />
      </div>
    </DirectionProvider>,
  );
  const trigger = screen.getByRole("combobox", { name: "States to Visit" }).element();
  expect(getComputedStyle(trigger).paddingInlineStart).toBe("12px");
  const indicator = trigger.querySelector<HTMLElement>('[data-slot="autocomplete-indicator"]')!;
  expect(indicator.getBoundingClientRect().left - trigger.getBoundingClientRect().left).toBe(8);
  await screen.getByRole("combobox", { name: "States to Visit" }).click();
  const list = screen.getByRole("listbox").element();
  await expect
    .poll(() => getComputedStyle(list.parentElement!).transform)
    .toBe("matrix(1, 0, 0, 1, 0, 0)");
  expect(getComputedStyle(list).fontSize).toBe("14px");
  const rows = screen.getByRole("option").elements();
  expect(rows[1]!.getBoundingClientRect().top - rows[0]!.getBoundingClientRect().bottom).toBe(4);
  const empty = screen.getByRole("status").element();
  expect(empty.getAttribute("aria-live")).toBe("polite");
  expect(empty.getAttribute("aria-atomic")).toBe("true");
  expect(empty.getAttribute("aria-hidden")).toBeNull();
  expect(empty.hasAttribute("hidden")).toBe(false);
  expect(getComputedStyle(empty).display).not.toBe("none");
  expect(empty.getBoundingClientRect().height).toBe(0);
  await screen.getByRole("combobox", { name: "Search options" }).fill("zzzz");
  await expect.element(screen.getByText("No results found")).toBeVisible();
  expect(getComputedStyle(empty).paddingTop).toBe("12px");
  expect(getComputedStyle(empty).paddingBottom).toBe("12px");
  expect(empty.getBoundingClientRect().height).toBeGreaterThan(24);
  await screen.getByRole("combobox", { name: "Search options" }).fill("");
  await expect.element(screen.getByRole("option", { name: "Florida" })).toBeVisible();
  expect(screen.getByRole("status").element()).toBe(empty);
  await expect.poll(() => empty.getBoundingClientRect().height).toBe(0);
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => document.activeElement).toBe(trigger);
});

// Source min-h-0 is needed when the popup has less space than its 320px list.
// Existing geometry checks don't prove the last option stays reachable there.
test("constrained list scrolls to its last native option without losing dynamic xstyle/ref/render", async () => {
  const ref = React.createRef<HTMLButtonElement>();
  const longItems = Array.from({ length: 30 }, (_, index) => `State ${index + 1}`);
  const screen = await render(
    <Autocomplete items={longItems}>
      <Autocomplete.Trigger
        ref={ref}
        aria-label="Long state list"
        xstyle={autocompleteTestStyles.trigger(287)}
        style={({ open }) => ({ letterSpacing: open ? 2 : 0 })}
        render={(props) => <button {...props} data-owner="native-render" />}
      >
        <Autocomplete.Value placeholder="Select" />
      </Autocomplete.Trigger>
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popover xstyle={autocompleteTestStyles.popup}>
            <Autocomplete.Input aria-label="Filter long list" />
            <Autocomplete.List>
              {(item: string) => (
                <Autocomplete.Item key={item} value={item}>
                  {item}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popover>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete>,
  );
  const trigger = screen.getByRole("combobox", { name: "Long state list" }).element();
  expect(ref.current).toBe(trigger);
  expect(trigger.getBoundingClientRect().width).toBe(287);
  expect(getComputedStyle(trigger).borderTopLeftRadius).toBe("19px");
  expect(getComputedStyle(trigger).paddingInlineEnd).toBe("12px");
  expect(trigger.getAttribute("data-owner")).toBe("native-render");
  await trigger.focus();
  await userEvent.keyboard("{ArrowDown}");
  const input = screen.getByRole("combobox", { name: "Filter long list" }).element();
  await expect.poll(() => document.activeElement).toBe(input);
  const list = screen.getByRole("listbox").element();
  const popup = list.parentElement!;
  await expect.poll(() => Math.round(popup.getBoundingClientRect().width)).toBe(287);
  expect(getComputedStyle(trigger).letterSpacing).toBe("2px");
  expect(popup.clientHeight).toBe(160);
  expect(getComputedStyle(popup).borderTopLeftRadius).toBe("19px");
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  await userEvent.keyboard("{End}");
  await expect
    .element(screen.getByRole("option", { name: "State 30" }))
    .toHaveAttribute("data-highlighted");
  await expect.poll(() => list.scrollTop).toBeGreaterThan(0);
  const last = screen.getByRole("option", { name: "State 30" }).element();
  await expect
    .poll(() => last.getBoundingClientRect().bottom <= list.getBoundingClientRect().bottom)
    .toBe(true);
  await userEvent.keyboard("{Enter}");
  await expect.poll(() => trigger.textContent).toContain("State 30");
  await expect.poll(() => document.activeElement).toBe(trigger);
  expect(trigger.getBoundingClientRect().width).toBe(287);
});

test("virtualized native rows retain the external 50px pitch and keyboard selection", async () => {
  const virtualItems = ["First", "Second", "Third"];
  const screen = await render(
    <Autocomplete.Root items={virtualItems} virtualized>
      <Autocomplete.Trigger aria-label="Virtual state">
        <Autocomplete.Value placeholder="Select" />
      </Autocomplete.Trigger>
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popover xstyle={autocompleteTestStyles.popup}>
            <Autocomplete.Input aria-label="Filter virtual states" />
            <Autocomplete.List style={{ position: "relative", height: 150 }}>
              {(item: string, index: number) => (
                <Autocomplete.Item
                  key={item}
                  value={item}
                  index={index}
                  style={{ position: "absolute", top: index * 50, height: 50 }}
                >
                  {item}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popover>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>,
  );
  const trigger = screen.getByRole("combobox", { name: "Virtual state" }).element();
  await screen.getByRole("combobox", { name: "Virtual state" }).click();
  const input = screen.getByRole("combobox", { name: "Filter virtual states" }).element();
  await expect.poll(() => document.activeElement).toBe(input);
  const list = screen.getByRole("listbox").element();
  await expect
    .poll(() => getComputedStyle(list.parentElement!).transform)
    .toBe("matrix(1, 0, 0, 1, 0, 0)");
  const rows = screen.getByRole("option").elements();
  expect(rows).toHaveLength(3);
  for (let index = 0; index < rows.length; index++) {
    expect(getComputedStyle(rows[index]!).marginTop).toBe("0px");
    expect(rows[index]!.getBoundingClientRect().height).toBe(50);
    if (index > 0)
      expect(
        rows[index]!.getBoundingClientRect().top - rows[index - 1]!.getBoundingClientRect().top,
      ).toBe(50);
  }
  await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
  await expect.poll(() => trigger.textContent).toContain("Second");
  await expect.poll(() => document.activeElement).toBe(trigger);
});
