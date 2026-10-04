import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { Menu } from "./menu.js";
import { Button } from "../button/index.js";

const styles = stylex.create({
  trigger: (spacing: number) => ({ letterSpacing: spacing }),
  popup: (radius: number) => ({ borderRadius: radius }),
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
