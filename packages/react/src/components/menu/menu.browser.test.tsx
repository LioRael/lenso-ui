import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { Menu } from "./menu.js";
import { Button } from "../button/index.js";
import { ThemeScope } from "../../utils/theme-scope.js";

const styles = stylex.create({
  trigger: (spacing: number) => ({ letterSpacing: spacing }),
  popup: (radius: number) => ({ borderRadius: radius }),
  input: (spacing: number) => ({ letterSpacing: spacing }),
});

// Story proof does not cover refs or native render callbacks through styled parts.
test.each(["element", "callback"] as const)(
  "canonical Menu preserves native %s rendering, refs, state callbacks and keyboard operation",
  async (mode) => {
    const triggerRef = React.createRef<HTMLButtonElement>();
    const popupRef = React.createRef<HTMLDivElement>();
    const openChange = vi.fn();
    const activate = vi.fn();
    const screen = await render(
      <Menu onOpenChange={openChange}>
        <Menu.Trigger
          ref={triggerRef}
          xstyle={styles.trigger(3)}
          style={({ open }) => ({ marginTop: open ? 9 : 3 })}
          render={
            mode === "element" ? (
              <Button>Actions</Button>
            ) : (
              (props) => <Button {...props}>Actions</Button>
            )
          }
        />
        <Menu.Portal>
          <Menu.Positioner>
            <Menu.Popup ref={popupRef} xstyle={styles.popup(17)}>
              <Menu.Item disabled>Unavailable</Menu.Item>
              <Menu.Item onClick={activate}>Run action</Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu>,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(triggerRef.current).toBe(trigger.element());
    expect(getComputedStyle(trigger.element()).letterSpacing).toBe("3px");
    expect(getComputedStyle(trigger.element()).marginTop).toBe("3px");
    trigger.element().focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(screen.getByRole("menu")).toBeVisible();
    expect(popupRef.current).toBe(screen.getByRole("menu").element());
    expect(getComputedStyle(popupRef.current!).padding).toBe("6px");
    expect(getComputedStyle(popupRef.current!).gap).toBe("2px");
    expect(getComputedStyle(popupRef.current!).borderTopLeftRadius).toBe("17px");
    expect(getComputedStyle(trigger.element()).marginTop).toBe("9px");
    await expect.element(screen.getByRole("menuitem", { name: "Run action" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(activate).toHaveBeenCalledTimes(1);
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
    expect(openChange.mock.calls.map(([open]) => open)).toEqual([true, false]);
    expect(openChange.mock.calls[0]![1]).toHaveProperty("reason");
  },
);

test("canonical Menu keeps checkbox, radio and nested submenu contracts", async () => {
  const checkbox = vi.fn();
  const radio = vi.fn();
  const screen = await render(
    <Menu>
      <Menu.Trigger>Preferences</Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner>
          <Menu.Popup>
            <Menu.CheckboxItem closeOnClick={false} onCheckedChange={checkbox}>
              <Menu.CheckboxItemIndicator />
              Bold
            </Menu.CheckboxItem>
            <Menu.RadioGroup defaultValue="left" onValueChange={radio}>
              <Menu.RadioItem value="left">Left</Menu.RadioItem>
              <Menu.RadioItem value="right">Right</Menu.RadioItem>
            </Menu.RadioGroup>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>Share</Menu.SubmenuTrigger>
              <Menu.Portal>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Item>Email</Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu>,
  );
  const trigger = screen.getByRole("button", { name: "Preferences" });
  await trigger.click();
  await screen.getByRole("menuitemcheckbox", { name: "Bold" }).click();
  expect(checkbox.mock.calls[0]![0]).toBe(true);
  await expect
    .element(screen.getByRole("menuitemcheckbox", { name: "Bold" }))
    .toHaveAttribute("aria-checked", "true");
  await screen.getByRole("menuitemradio", { name: "Right" }).click();
  expect(radio.mock.calls[0]![0]).toBe("right");
  await trigger.click();
  screen.getByRole("menuitem", { name: "Share" }).element().focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(screen.getByRole("menuitem", { name: "Email" })).toBeVisible();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(screen.getByRole("menuitem", { name: "Share" })).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
});

test.each([
  { theme: "light", width: 390 },
  { theme: "dark", width: 390 },
  { theme: "light", width: 1280 },
  { theme: "dark", width: 1280 },
] as const)(
  "filterable Menu in $theme at $width preserves filtering, focus and style composition",
  async ({ theme, width }) => {
    await page.viewport(width, 900);
    try {
      const inputRef = React.createRef<HTMLInputElement>();
      const activate = vi.fn();
      const screen = await render(
        <ThemeScope theme={theme}>
          <Menu.FilterProvider>
            <Menu>
              <Menu.Trigger>Find action</Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner>
                  <Menu.Popup>
                    <Menu.Input
                      ref={inputRef}
                      aria-label="Filter actions"
                      xstyle={styles.input(2)}
                      style={() => ({ marginTop: 7 })}
                      render={(props) => <input {...props} data-testid="menu-filter" />}
                    />
                    <Menu.List>
                      <Menu.Item onClick={activate}>Copy link</Menu.Item>
                      <Menu.Item>Download file</Menu.Item>
                    </Menu.List>
                    <Menu.Empty>No matching actions</Menu.Empty>
                    <Menu.Clear>Clear filter</Menu.Clear>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu>
          </Menu.FilterProvider>
        </ThemeScope>,
      );
      const trigger = screen.getByRole("button", { name: "Find action" });
      await trigger.click();
      const input = screen.getByRole("searchbox", { name: "Filter actions" });
      expect(inputRef.current).toBe(input.element());
      await expect.element(input).toHaveFocus();
      expect(getComputedStyle(input.element()).letterSpacing).toBe("2px");
      expect(getComputedStyle(input.element()).marginTop).toBe("7px");
      const popup = input.element().closest<HTMLElement>('[data-slot="menu-popup"]')!;
      await expect.poll(() => getComputedStyle(popup).transform).toBe("matrix(1, 0, 0, 1, 0, 0)");
      expect(popup.scrollWidth).toBeLessThanOrEqual(popup.clientWidth);
      expect(input.element().getBoundingClientRect().right).toBeLessThanOrEqual(
        popup.getBoundingClientRect().right,
      );
      await userEvent.type(input, "copy");
      await expect.element(screen.getByRole("menuitem", { name: "Copy link" })).toBeVisible();
      await expect
        .element(screen.getByRole("menuitem", { name: "Download file" }))
        .not.toBeInTheDocument();
      await userEvent.keyboard("{ArrowDown}{Enter}");
      expect(activate).toHaveBeenCalledTimes(1);
      await expect.element(trigger).toHaveAttribute("aria-expanded", "false");

      await trigger.click();
      const openedInput = screen.getByRole("searchbox", { name: "Filter actions" });
      await userEvent.type(openedInput, "missing");
      await expect.element(screen.getByText("No matching actions")).toBeVisible();
      await screen.getByText("Clear filter").click();
      await expect.element(screen.getByRole("menuitem", { name: "Copy link" })).toBeVisible();
      await userEvent.keyboard("{Escape}");
      await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
      await expect.element(trigger).toHaveFocus();
    } finally {
      await page.viewport(1280, 900);
    }
  },
);
