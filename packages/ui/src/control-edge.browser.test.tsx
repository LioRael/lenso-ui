import { themeColor } from "./shared/test-theme.js";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";

import "../../tokens/src/styles.css";
import { Menu } from "./menu/index.js";
import { Select } from "./select/index.js";
import { TextField } from "./text-field/index.js";
import { ThemeScope } from "./theme-scope/index.js";

for (const [theme] of [
  ["light", themeColor("light", "color.border.decorative")],
  ["dark", themeColor("dark", "color.border.control")],
] as const) {
  test(`boxed control edges match in ${theme} mode`, async () => {
    const screen = await render(
      <ThemeScope theme={theme}>
        <div
          data-testid="pointer-parking"
          style={{ bottom: 0, height: 20, position: "fixed", right: 0, width: 20, zIndex: 1 }}
        />
        <TextField.Root>
          <TextField.Control aria-label="Title" data-testid="text-input" />
        </TextField.Root>
        <Select.Root defaultValue="active" items={[{ label: "Active", value: "active" }]}>
          <Select.Trigger aria-label="Status" data-testid="select-trigger">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
        </Select.Root>
        <Menu.Root>
          <Menu.ControlTrigger data-testid="menu-trigger">Actions</Menu.ControlTrigger>
        </Menu.Root>
      </ThemeScope>,
    );

    await screen.getByTestId("pointer-parking").hover();

    const controls: HTMLElement[] = ["text-input", "select-trigger", "menu-trigger"].map(
      (testId) => screen.getByTestId(testId).element() as HTMLElement,
    );
    const textInputStyle = getComputedStyle(controls[0]!);

    for (const control of controls) {
      const computed = getComputedStyle(control);
      expect(computed.backgroundColor).toBe(themeColor(theme, "color.surface.control"));
      expect(computed.borderColor).toBe(themeColor(theme, "color.border.control"));
      expect(computed.borderRadius).toBe("6px");
      expect(computed.borderStyle).toBe("solid");
      expect(computed.borderWidth).toBe(textInputStyle.borderWidth);
      expect(computed.boxShadow).toBe("none");
      expect(control.getBoundingClientRect().height).toBe(32);
    }
  });
}

for (const [theme] of [
  [
    "light",
    themeColor("light", "color.border.controlFocus"),
    themeColor("light", "color.focus.ring"),
  ],
  [
    "dark",
    themeColor("dark", "color.border.controlFocus"),
    themeColor("light", "color.focus.ring"),
  ],
] as const) {
  test(`text field interaction edges match Linear in ${theme} mode`, async () => {
    const screen = await render(
      <ThemeScope theme={theme}>
        <TextField.Root>
          <TextField.Control aria-label="Title" data-testid="text-input" />
        </TextField.Root>
      </ThemeScope>,
    );

    const input = screen.getByTestId("text-input");
    await input.hover();
    await expect
      .poll(() => getComputedStyle(input.element()).borderColor)
      .toBe(themeColor(theme, "color.border.controlFocus"));

    await input.click();
    await expect
      .poll(() => getComputedStyle(input.element()).outlineColor)
      .toBe(themeColor(theme, "color.focus.ring"));
    expect(getComputedStyle(input.element()).outlineOffset).toBe("-1px");
    expect(getComputedStyle(input.element()).outlineWidth).toBe("2px");
  });
}

for (const [theme, expectedBackground] of [
  ["light", themeColor("light", "color.surface.interactiveHover")],
  ["dark", themeColor("dark", "color.surface.overlayHover")],
] as const) {
  test(`select trigger resolves its semantic hover surface in ${theme} mode`, async () => {
    const screen = await render(
      <ThemeScope theme={theme}>
        <Select.Root defaultValue="active" items={[{ label: "Active", value: "active" }]}>
          <Select.Trigger aria-label="Status">
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
        </Select.Root>
      </ThemeScope>,
    );

    const trigger = screen.getByRole("combobox", { name: "Status" });
    await userEvent.hover(trigger);

    await expect
      .poll(() => getComputedStyle(trigger.element()).backgroundColor)
      .toBe(expectedBackground);
  });
}
