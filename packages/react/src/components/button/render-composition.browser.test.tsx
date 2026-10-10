import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import type { CollapsibleTriggerState } from "@base-ui/react/collapsible";
import type { HTMLProps } from "@base-ui/react/use-render";
import "virtual:stylex:runtime";
import "@lenso/tokens/styles.css";
import { Button } from "./button.js";
import { Disclosure } from "../disclosure/index.js";
import { Toolbar } from "../toolbar/toolbar.js";

const styles = stylex.create({
  trigger: (spacing: number) => ({ letterSpacing: spacing }),
  button: (radius: number) => ({ borderRadius: radius }),
});

// Existing render tests covered native elements, not an injected class crossing a styled component.
test.each(["element", "callback"] as const)(
  "native %s rendering through Button retains independent styles, refs and activation",
  async (mode) => {
    const triggerRef = React.createRef<HTMLButtonElement>();
    const buttonRef = React.createRef<HTMLButtonElement>();
    const parentClick = vi.fn();
    const childClick = vi.fn();
    const screen = await render(
      <Disclosure>
        <Disclosure.Trigger
          ref={triggerRef}
          xstyle={styles.trigger(4)}
          style={({ open }: CollapsibleTriggerState) => ({ marginTop: open ? 9 : 3 })}
          onClick={parentClick}
          render={
            mode === "element" ? (
              <Button ref={buttonRef} xstyle={styles.button(19)} onClick={childClick}>
                Toggle details
              </Button>
            ) : (
              (props: HTMLProps) => (
                <Button {...props} xstyle={styles.button(19)}>
                  Toggle details
                </Button>
              )
            )
          }
        />
        <Disclosure.Content>Native panel content</Disclosure.Content>
      </Disclosure>,
    );
    const button = screen.getByRole("button", { name: "Toggle details" });
    const element = button.element();
    expect(triggerRef.current).toBe(element);
    if (mode === "element") expect(buttonRef.current).toBe(element);
    await expect.poll(() => getComputedStyle(element).letterSpacing).toBe("4px");
    await expect.poll(() => getComputedStyle(element).borderTopLeftRadius).toBe("19px");
    expect(getComputedStyle(element).marginTop).toBe("3px");
    await button.click();
    await expect.element(button).toHaveAttribute("aria-expanded", "true");
    await expect.element(screen.getByText("Native panel content")).toBeVisible();
    expect(parentClick).toHaveBeenCalledTimes(1);
    if (mode === "element") expect(childClick).toHaveBeenCalledTimes(1);
    expect(getComputedStyle(element).marginTop).toBe("9px");
    await userEvent.keyboard("{Enter}");
    await expect.element(button).toHaveAttribute("aria-expanded", "false");
    expect(parentClick).toHaveBeenCalledTimes(2);
    await expect.poll(() => getComputedStyle(element).letterSpacing).toBe("4px");
  },
);

// Toolbar.Button previously discarded the class injected by Button's native render composition.
test("Toolbar buttons retain caller styles, refs and activation through Button", async () => {
  const buttonRef = React.createRef<HTMLButtonElement>();
  const toolbarRef = React.createRef<HTMLButtonElement>();
  const clicked = vi.fn();
  const screen = await render(
    <Toolbar aria-label="Editing">
      <Button
        ref={buttonRef}
        variant="tertiary"
        xstyle={styles.trigger(4)}
        style={{ marginTop: 3 }}
        onClick={clicked}
        render={<Toolbar.Button ref={toolbarRef} variant="tertiary" />}
      >
        Copy
      </Button>
    </Toolbar>,
  );
  const button = screen.getByRole("button", { name: "Copy" });
  const element = button.element();
  expect(buttonRef.current).toBe(element);
  expect(toolbarRef.current).toBe(element);
  await expect.poll(() => getComputedStyle(element).letterSpacing).toBe("4px");
  expect(getComputedStyle(element).marginTop).toBe("3px");
  await button.click();
  expect(clicked).toHaveBeenCalledTimes(1);
  await userEvent.keyboard("{Enter}");
  expect(clicked).toHaveBeenCalledTimes(2);
});
