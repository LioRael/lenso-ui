import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";

import "../../tokens/src/styles.css";
import { Menu } from "./menu/index.js";
import { Select } from "./select/index.js";
import { TextField } from "./text-field/index.js";
import { ThemeScope } from "./theme-scope/index.js";

for (const [theme, expectedBorder] of [
  ["light", "rgb(216, 216, 216)"],
  ["dark", "rgb(72, 73, 76)"],
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
      expect(computed.backgroundColor).toBe(
        theme === "light" ? "rgb(255, 255, 255)" : "rgb(25, 26, 27)",
      );
      expect(computed.borderColor).toBe(expectedBorder);
      expect(computed.borderRadius).toBe("8px");
      expect(computed.borderStyle).toBe("solid");
      expect(computed.borderWidth).toBe(textInputStyle.borderWidth);
      expect(computed.boxShadow).toBe("none");
      expect(control.getBoundingClientRect().height).toBe(32);
    }
  });
}

for (const [theme, expectedHoverBorder, expectedFocusRing] of [
  ["light", "rgb(194, 194, 194)", "rgb(109, 120, 213)"],
  ["dark", "rgb(62, 66, 77)", "rgb(94, 106, 210)"],
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
    expect(getComputedStyle(input.element()).borderColor).toBe(expectedHoverBorder);

    await input.click();
    expect(getComputedStyle(input.element()).outlineColor).toBe(expectedFocusRing);
    expect(getComputedStyle(input.element()).outlineWidth).toBe("1px");
  });
}

for (const [theme, expectedBackground] of [
  ["light", "rgb(240, 240, 241)"],
  ["dark", "rgb(57, 58, 61)"],
] as const) {
  test(`select trigger resolves its Figma hover surface in ${theme} mode`, async () => {
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
