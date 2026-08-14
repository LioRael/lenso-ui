import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "virtual:stylex:runtime";

import { semanticTokenNames } from "@lenso/tokens";

import { Button } from "./button/index.js";
import { Dialog } from "./dialog/index.js";
import { TextField } from "./text-field/index.js";
import { ThemeScope } from "./theme-scope/index.js";

test("Button preserves native behavior while exposing Lenso variants", async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Button onClick={onClick} size="compact" variant="primary">
      Continue
    </Button>,
  );
  const button = screen.getByRole("button", { name: "Continue" });

  expect(getComputedStyle(button.element()).borderRadius).toBe("999px");

  await button.click();

  expect(onClick).toHaveBeenCalledOnce();
  await expect.element(button).toHaveAttribute("data-size", "compact");
  await expect.element(button).toHaveAttribute("data-variant", "primary");
});

test("Button loading state is busy and non-interactive", async () => {
  const screen = await render(<Button loading>Save</Button>);
  const button = screen.getByRole("button", { name: "Save" });

  await expect.element(button).toBeDisabled();
  await expect.element(button).toHaveAttribute("aria-busy", "true");
});

test("TextField wires its compound label, control, description, and error", async () => {
  const screen = await render(
    <TextField.Root invalid>
      <TextField.Label>Workspace name</TextField.Label>
      <TextField.Control placeholder="Enter value" />
      <TextField.Description>Shown to teammates.</TextField.Description>
      <TextField.Error match>Choose another name.</TextField.Error>
    </TextField.Root>,
  );

  const input = screen.getByRole("textbox", { name: "Workspace name" });
  await expect.element(input).toHaveAttribute("aria-invalid", "true");
  await expect.element(screen.getByText("Shown to teammates.")).toBeVisible();
  await expect.element(screen.getByText("Choose another name.")).toBeVisible();
});

test("Dialog portals into the nearest theme scope and closes with Escape", async () => {
  const screen = await render(
    <ThemeScope theme="dark" data-testid="theme-host">
      <Dialog.Root>
        <Dialog.Trigger>Open settings</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup>
              <Dialog.Title>Settings</Dialog.Title>
              <Dialog.Description>Manage this workspace.</Dialog.Description>
              <Dialog.Close>Close settings</Dialog.Close>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </ThemeScope>,
  );

  await screen.getByRole("button", { name: "Open settings" }).click();
  await expect.element(screen.getByRole("dialog", { name: "Settings" })).toBeVisible();
  const themeHost = screen.getByTestId("theme-host");
  await expect.element(themeHost).toHaveAttribute("data-theme", "dark");
  expect(themeHost.element().querySelector('[role="dialog"]')).toBeNull();
  const portalHost = document.body.querySelector('[data-slot="theme-portal-host"]');
  expect(portalHost?.getAttribute("data-theme")).toBe("dark");
  expect(portalHost?.querySelector('[role="dialog"]')).not.toBeNull();
  const popup = screen.getByRole("dialog", { name: "Settings" });
  expect(getComputedStyle(popup.element()).position).toBe("relative");
  const popupRect = popup.element().getBoundingClientRect();
  const closeRect = screen
    .getByRole("button", { name: "Close settings" })
    .element()
    .getBoundingClientRect();
  expect(closeRect.right).toBeLessThanOrEqual(popupRect.right);

  const accessibility = await axe.run(document.body);
  expect(accessibility.violations).toEqual([]);

  await userEvent.keyboard("{Escape}");
  await expect.element(screen.getByRole("dialog", { name: "Settings" })).not.toBeInTheDocument();
});

test("the MVP foundation surface has no automatic accessibility violations", async () => {
  await render(
    <main>
      <Button>Continue</Button>
      <TextField.Root>
        <TextField.Label>Name</TextField.Label>
        <TextField.Control />
        <TextField.Description>Your public name.</TextField.Description>
      </TextField.Root>
    </main>,
  );

  const result = await axe.run(document.body);
  expect(result.violations).toEqual([]);
});

test("nested scopes inherit the nearest theme and merge partial overrides into portals", async () => {
  const screen = await render(
    <ThemeScope
      theme="dark"
      overrides={{ "color.content.primary": "#123456" }}
      data-testid="outer-scope"
    >
      <ThemeScope overrides={{ "color.content.secondary": "#654321" }} data-testid="inner-scope">
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Viewport>
              <Dialog.Popup>
                <Dialog.Title>Inherited dialog</Dialog.Title>
              </Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Portal>
        </Dialog.Root>
      </ThemeScope>
    </ThemeScope>,
  );

  const inner = screen.getByTestId("inner-scope");
  await expect.element(inner).toHaveAttribute("data-theme", "dark");
  expect(inner.element().style.getPropertyValue(semanticTokenNames["color.content.primary"])).toBe(
    "#123456",
  );
  expect(
    inner.element().style.getPropertyValue(semanticTokenNames["color.content.secondary"]),
  ).toBe("#654321");

  const dialog = screen.getByRole("dialog", { name: "Inherited dialog" });
  await expect.element(dialog).toBeVisible();
  await expect.poll(() => getComputedStyle(dialog.element()).color).toBe("rgb(18, 52, 86)");
  const portalHost = dialog.element().closest('[data-slot="theme-portal-host"]') as HTMLElement;
  expect(portalHost.dataset.theme).toBe("dark");
  expect(portalHost.style.getPropertyValue(semanticTokenNames["color.content.primary"])).toBe(
    "#123456",
  );
  expect(portalHost.style.getPropertyValue(semanticTokenNames["color.content.secondary"])).toBe(
    "#654321",
  );
});
