import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";

import "../../tokens/src/styles.css";
import { Menu } from "./menu/index.js";
import { Select } from "./select/index.js";
import { TextField } from "./text-field/index.js";
import { ThemeScope } from "./theme-scope/index.js";

for (const [theme, expectedBorder] of [
  ["light", "rgb(212, 212, 212)"],
  ["dark", "rgb(72, 73, 76)"],
] as const) {
  test(`boxed control edges match in ${theme} mode`, async () => {
    const screen = await render(
      <ThemeScope theme={theme}>
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
