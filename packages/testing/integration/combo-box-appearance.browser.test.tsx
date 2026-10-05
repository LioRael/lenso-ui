/**
 * HeroUI v3.2.6 CustomStyles/OnSurface scene adaptations; Apache-2.0.
 * Modified: native Base UI fixtures and compiled paint/interaction assertions.
 */
import * as React from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { ComboBox } from "@lenso/ui";
import { Field } from "@base-ui/react/field";
import { comboBoxTestStyles as overrides } from "../../styles/src/components/combo-box/combo-box.test-styles.js";
import { OnSurface } from "../../../apps/docs/src/demos/en/combo-box/on-surface";

const frameworks = ["React", "Vue", "Svelte"];

// The real source adaptation used a background-only workaround before variants existed.
// Fixture-only paint tests did not prove it consumed the new native secondary contract.
test.each(["light", "dark"] as const)(
  "live OnSurface adaptation uses the complete secondary field in %s",
  async (theme) => {
    const screen = await render(
      <div data-theme={theme}>
        <OnSurface />
        <span
          data-testid="default-fill"
          style={{
            display: "block",
            width: 8,
            height: 8,
            backgroundColor: "var(--default)",
          }}
        />
      </div>,
    );
    const input = screen.getByRole("combobox").element();
    const shell = input.closest<HTMLElement>('[data-slot="combo-box-input-group"]')!;
    // Enter and leave hover explicitly; prior tests may leave the pointer over this field.
    await screen.getByRole("combobox").hover();
    await screen.getByTestId("default-fill").hover();
    const fill = getComputedStyle(screen.getByTestId("default-fill").element()).backgroundColor;
    await expect.poll(() => getComputedStyle(shell).backgroundColor).toBe(fill);
    await expect.poll(() => getComputedStyle(shell).boxShadow).toBe("none");
    expect(getComputedStyle(input).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(shell.getBoundingClientRect().width).toBe(272);
  },
);

function Options() {
  return (
    <ComboBox.Portal>
      <ComboBox.Positioner>
        <ComboBox.Popover>
          <ComboBox.List>
            {(item: string) => (
              <ComboBox.Item key={item} value={item}>
                {item}
              </ComboBox.Item>
            )}
          </ComboBox.List>
          <ComboBox.Empty>No results</ComboBox.Empty>
        </ComboBox.Popover>
      </ComboBox.Positioner>
    </ComboBox.Portal>
  );
}

// Pinned CustomStyles paints InputGroup; previously the opaque Input hid its shell.
for (const theme of ["light", "dark"] as const) {
  test(`CustomStyles shell paints the native compound without an opaque inner field in ${theme}`, async () => {
    const screen = await render(
      <div data-theme={theme}>
        <ComboBox items={frameworks}>
          <ComboBox.InputGroup data-testid="custom-shell" xstyle={overrides.customShell}>
            <ComboBox.Input aria-label="Framework" placeholder="Search..." />
            <ComboBox.Trigger aria-label="Show frameworks">
              <ComboBox.Indicator />
            </ComboBox.Trigger>
          </ComboBox.InputGroup>
          <Options />
        </ComboBox>
        <span
          data-testid="custom-probe"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
            boxShadow: "0 1px 2px rgb(0 0 0 / 10%)",
          }}
        />
      </div>,
    );
    const shell = screen.getByTestId("custom-shell").element();
    const input = screen.getByRole("combobox").element();
    const shellPaint = getComputedStyle(shell);
    const inputPaint = getComputedStyle(input);
    await expect.poll(() => getComputedStyle(input).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    const probe = getComputedStyle(screen.getByTestId("custom-probe").element());
    expect(shellPaint.borderTopLeftRadius).toBe("12px");
    expect(shellPaint.borderTopWidth).toBe("1px");
    expect(shellPaint.borderTopColor).toBe(probe.borderTopColor);
    expect(shellPaint.backgroundColor).toBe(probe.backgroundColor);
    await expect.poll(() => getComputedStyle(shell).boxShadow).toBe(probe.boxShadow);
    expect(shellPaint.boxShadow).not.toBe("none");
    expect(inputPaint.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(inputPaint.borderTopWidth).toBe("0px");
    expect(inputPaint.boxShadow).toBe("none");
    expect(inputPaint.outlineStyle).toBe("none");
    expect(shell.getBoundingClientRect().width).toBe(256);
    expect(shell.getBoundingClientRect().height).toBe(38);
    expect(input.getBoundingClientRect().left - shell.getBoundingClientRect().left).toBe(1);
    await input.focus();
    expect(getComputedStyle(input).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await expect.poll(() => getComputedStyle(shell).outlineWidth).toBe("2px");
  });
}

// Pinned OnSurface sets Root variant="secondary"; existing coverage had no group paint assertion.
for (const theme of ["light", "dark"] as const) {
  test(`OnSurface secondary field uses source default/hover/focus paint in ${theme}`, async () => {
    const screen = await render(
      <div
        data-theme={theme}
        style={{ width: 320, padding: 24, backgroundColor: "var(--surface)" }}
      >
        <ComboBox variant="secondary" fullWidth items={frameworks}>
          <ComboBox.InputGroup data-testid="secondary-shell">
            <ComboBox.Input aria-label="Favorite framework" />
            <ComboBox.Trigger aria-label="Show frameworks" />
          </ComboBox.InputGroup>
          <Options />
        </ComboBox>
        <ComboBox variant="secondary" fullWidth>
          <ComboBox.InputGroup variant="primary" data-testid="primary-shell">
            <ComboBox.Input aria-label="Primary framework" />
          </ComboBox.InputGroup>
        </ComboBox>
        <ComboBox variant="secondary">
          <ComboBox.Input aria-label="Standalone secondary" />
        </ComboBox>
        <span
          data-testid="default-probe"
          style={{ display: "block", width: 8, height: 8, backgroundColor: "var(--default)" }}
        />
        <span data-testid="hover-probe" style={{ backgroundColor: "var(--default-hover)" }} />
        <span
          data-testid="focus-border-probe"
          style={{ borderColor: "var(--field-border-focus)" }}
        />
        <span
          data-testid="primary-probe"
          style={{ backgroundColor: "var(--field-background)", boxShadow: "var(--field-shadow)" }}
        />
      </div>,
    );
    const shell = screen.getByTestId("secondary-shell").element();
    const input = screen.getByRole("combobox", { name: "Favorite framework" }).element();
    const fill = getComputedStyle(screen.getByTestId("default-probe").element()).backgroundColor;
    await screen.getByTestId("default-probe").hover();
    await expect.poll(() => getComputedStyle(shell).backgroundColor).toBe(fill);
    const primary = screen.getByTestId("primary-shell").element();
    const primaryProbe = getComputedStyle(screen.getByTestId("primary-probe").element());
    await expect
      .poll(() => getComputedStyle(primary).backgroundColor)
      .toBe(primaryProbe.backgroundColor);
    await expect.poll(() => getComputedStyle(primary).boxShadow).toBe(primaryProbe.boxShadow);
    const standalone = screen.getByRole("combobox", { name: "Standalone secondary" }).element();
    await expect.poll(() => getComputedStyle(standalone).backgroundColor).toBe(fill);
    await expect.poll(() => getComputedStyle(standalone).boxShadow).toBe("none");
    expect(getComputedStyle(shell).boxShadow).toBe("none");
    expect(shell.getBoundingClientRect().width).toBe(272);
    expect(shell.getBoundingClientRect().height).toBe(36);
    expect(input.getBoundingClientRect().height).toBe(36);
    await screen.getByTestId("secondary-shell").hover();
    await expect
      .poll(() => getComputedStyle(shell).backgroundColor)
      .toBe(getComputedStyle(screen.getByTestId("hover-probe").element()).backgroundColor);
    await input.focus();
    await expect.poll(() => getComputedStyle(shell).backgroundColor).toBe(fill);
    await expect
      .poll(() => getComputedStyle(shell).borderTopColor)
      .toBe(getComputedStyle(screen.getByTestId("focus-border-probe").element()).borderTopColor);
    expect(getComputedStyle(input).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });
}

test("native grouped disabled/invalid paint and standalone input retain field geometry", async () => {
  const screen = await render(
    <>
      <ComboBox disabled>
        <ComboBox.InputGroup data-testid="disabled-shell">
          <ComboBox.Input aria-label="Disabled framework" />
          <ComboBox.Trigger aria-label="Disabled options" />
        </ComboBox.InputGroup>
      </ComboBox>
      <Field.Root invalid>
        <ComboBox>
          <ComboBox.InputGroup data-testid="invalid-shell">
            <ComboBox.Input aria-label="Invalid framework" />
          </ComboBox.InputGroup>
        </ComboBox>
      </Field.Root>
      <ComboBox>
        <ComboBox.Input aria-label="Standalone framework" />
      </ComboBox>
      <span data-testid="danger-probe" style={{ borderColor: "var(--danger)" }} />
      <span
        data-testid="field-probe"
        style={{ backgroundColor: "var(--field-background)", boxShadow: "var(--field-shadow)" }}
      />
    </>,
  );
  const disabled = screen.getByTestId("disabled-shell").element();
  expect(getComputedStyle(disabled).opacity).toBe("0.5");
  // A disabled control must dim its own field, not every ancestor containing it.
  for (let ancestor = disabled.parentElement; ancestor; ancestor = ancestor.parentElement) {
    expect(getComputedStyle(ancestor).opacity).toBe("1");
  }
  expect(
    getComputedStyle(screen.getByRole("button", { name: "Disabled options" }).element()).opacity,
  ).toBe("1");
  await expect.element(screen.getByRole("combobox", { name: "Disabled framework" })).toBeDisabled();
  const invalid = screen.getByTestId("invalid-shell").element();
  await expect
    .element(screen.getByRole("combobox", { name: "Invalid framework" }))
    .toHaveAttribute("aria-invalid", "true");
  await screen.getByTestId("invalid-shell").hover();
  await expect
    .poll(() => getComputedStyle(invalid).borderTopColor)
    .toBe(getComputedStyle(screen.getByTestId("danger-probe").element()).borderTopColor);
  const standalone = screen.getByRole("combobox", { name: "Standalone framework" }).element();
  const probe = getComputedStyle(screen.getByTestId("field-probe").element());
  expect(getComputedStyle(standalone).backgroundColor).toBe(probe.backgroundColor);
  expect(getComputedStyle(standalone).boxShadow).toBe(probe.boxShadow);
  expect(getComputedStyle(standalone).borderTopLeftRadius).toBe("12px");
  expect(standalone.getBoundingClientRect().height).toBe(36);
  await page.viewport(390, 844);
  try {
    expect(getComputedStyle(standalone).fontSize).toBe("16px");
    expect(standalone.getBoundingClientRect().height).toBe(36);
  } finally {
    await page.viewport(1280, 900);
  }
});

test("dynamic xstyle, native state callbacks, caller metadata, input/group refs and render coexist", async () => {
  const groupRef = React.createRef<HTMLDivElement>();
  const inputRef = React.createRef<HTMLInputElement>();
  const change = vi.fn();
  const screen = await render(
    <ComboBox items={frameworks} onValueChange={change}>
      <ComboBox.InputGroup
        ref={groupRef}
        data-slot="caller-shell"
        data-testid="dynamic-shell"
        xstyle={overrides.dynamicShell(287)}
        style={({ open }) => ({ marginTop: open ? 9 : 3 })}
        render={(props, state) => (
          <div {...props} data-owner="group-render" data-open-probe={state.open ? "yes" : "no"} />
        )}
      >
        <ComboBox.Input
          ref={inputRef}
          xstyle={overrides.dynamicInput(17)}
          style={({ open }) => ({ letterSpacing: open ? 2 : 1 })}
          data-slot="caller-input"
          render={<input aria-label="Rendered framework" data-owner="input-render" />}
        />
        <ComboBox.Trigger aria-label="Show frameworks" />
      </ComboBox.InputGroup>
      <Options />
    </ComboBox>,
  );
  const shell = screen.getByTestId("dynamic-shell").element();
  const input = screen.getByRole("combobox").element();
  expect(groupRef.current).toBe(shell);
  expect(inputRef.current).toBe(input);
  expect(shell.getAttribute("data-slot")).toBe("caller-shell");
  expect(shell.getAttribute("data-owner")).toBe("group-render");
  expect(input.getAttribute("data-slot")).toBe("caller-input");
  expect(input.getAttribute("data-owner")).toBe("input-render");
  expect(shell.getBoundingClientRect().width).toBe(287);
  expect(getComputedStyle(shell).borderTopLeftRadius).toBe("19px");
  expect(getComputedStyle(shell).backgroundColor).toBe("rgb(12, 34, 56)");
  expect(getComputedStyle(shell).marginTop).toBe("3px");
  expect(getComputedStyle(input).paddingInlineStart).toBe("17px");
  await screen.getByRole("combobox").fill("Vu");
  await expect.element(screen.getByRole("option", { name: "Vue" })).toBeVisible();
  expect(screen.getByRole("option", { name: "React" }).query()).toBeNull();
  expect(getComputedStyle(shell).marginTop).toBe("9px");
  expect(shell.getAttribute("data-open-probe")).toBe("yes");
  expect(shell.getBoundingClientRect().width).toBe(287);
  expect(getComputedStyle(shell).backgroundColor).toBe("rgb(12, 34, 56)");
  expect(getComputedStyle(input).letterSpacing).toBe("2px");
  expect(getComputedStyle(input).paddingInlineStart).toBe("17px");
  const popup = screen.getByRole("listbox").element().parentElement!;
  await expect.poll(() => Math.round(popup.getBoundingClientRect().width)).toBe(287);
  // Base's default collision padding keeps a viewport-edge anchor's popup 5px inward.
  await expect
    .poll(() => Math.round(popup.getBoundingClientRect().left))
    .toBe(Math.max(5, Math.round(shell.getBoundingClientRect().left)));
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect.element(screen.getByRole("combobox")).toHaveValue("Vue");
  expect(change).toHaveBeenCalledWith("Vue", expect.anything());
});

test("multiple native chips keep keyboard selection and removal inside the painted shell", async () => {
  const change = vi.fn();
  const screen = await render(
    <ComboBox multiple items={frameworks} defaultValue={["React", "Vue"]} onValueChange={change}>
      <ComboBox.InputGroup xstyle={overrides.customShell}>
        <ComboBox.Chips>
          <ComboBox.Value>
            {(values: string[]) =>
              values.map((value) => (
                <ComboBox.Chip key={value} aria-label={value}>
                  {value}
                  <ComboBox.ChipRemove aria-label={`Remove ${value}`} />
                </ComboBox.Chip>
              ))
            }
          </ComboBox.Value>
          <ComboBox.Input aria-label="Frameworks" />
        </ComboBox.Chips>
        <ComboBox.Trigger aria-label="Show frameworks" />
      </ComboBox.InputGroup>
      <Options />
    </ComboBox>,
  );
  await screen.getByRole("button", { name: "Remove React" }).click();
  expect(change).toHaveBeenLastCalledWith(["Vue"], expect.anything());
  await screen.getByRole("combobox").fill("Svel");
  await userEvent.keyboard("{ArrowDown}{Enter}");
  expect(change).toHaveBeenLastCalledWith(["Vue", "Svelte"], expect.anything());
  await expect.element(screen.getByRole("button", { name: "Remove Svelte" })).toBeVisible();
});
