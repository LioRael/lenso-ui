import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "virtual:stylex:runtime";

import { semanticTokenNames } from "@lenso/tokens";

import "../../tokens/src/styles.css";
import { Button } from "./button/index.js";
import { Dialog } from "./dialog/index.js";
import { IconButton } from "./icon-button/index.js";
import { Label } from "./label/index.js";
import { TextField } from "./text-field/index.js";
import { ThemeScope } from "./theme-scope/index.js";
import { PlusIcon } from "lucide-react";

test("Button preserves native behavior while exposing Lenso variants", async () => {
  const onClick = vi.fn();
  const screen = await render(
    <Button onClick={onClick} size="compact" variant="primary">
      Continue
    </Button>,
  );
  const button = screen.getByRole("button", { name: "Continue" });

  await expect.poll(() => getComputedStyle(button.element()).borderRadius).toBe("999px");

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
  await expect.poll(() => getComputedStyle(button.element()).opacity).toBe("1");
  const spinner = button.element().querySelector("svg");
  expect(spinner?.getBoundingClientRect().toJSON()).toMatchObject({ height: 10, width: 10 });
  expect(spinner?.querySelector("path[mask]")).not.toBeNull();
});

test("Button hover and keyboard focus use the approved state layers", async () => {
  const screen = await render(<Button>Continue</Button>);
  const button = screen.getByRole("button", { name: "Continue" });
  const stateLayer = button
    .element()
    .querySelector<HTMLElement>('[data-slot="button-state-layer"]');

  await button.hover();
  await expect
    .poll(() => getComputedStyle(button.element()).backgroundColor)
    .toBe("rgb(31, 32, 36)");
  await button.unhover();
  await userEvent.tab();
  await expect.poll(() => getComputedStyle(stateLayer!).borderColor).toBe("rgb(94, 106, 210)");
});

test("Button state layers resolve through a dark ThemeScope", async () => {
  const screen = await render(
    <ThemeScope theme="dark">
      <Button data-visual-state="hover">Hover</Button>
      <Button data-visual-state="pressed" variant="secondary">
        Pressed
      </Button>
      <Button disabled variant="ghost">
        Disabled
      </Button>
    </ThemeScope>,
  );
  const hover = screen.getByRole("button", { name: "Hover" }).element();
  const pressed = screen.getByRole("button", { name: "Pressed" }).element();
  const disabled = screen.getByRole("button", { name: "Disabled" }).element();

  await expect.poll(() => getComputedStyle(hover).backgroundColor).toBe("rgb(255, 255, 255)");
  expect(getComputedStyle(pressed).backgroundColor).toBe("rgb(25, 26, 27)");
  expect(
    getComputedStyle(pressed.querySelector<HTMLElement>('[data-slot="button-state-layer"]')!)
      .backgroundColor,
  ).toBe("rgba(255, 255, 255, 0.05)");
  expect(getComputedStyle(disabled).opacity).toBe("0.5");
});

test("Icon Button preserves Base UI render composition and an accessible name", async () => {
  const screen = await render(
    <IconButton aria-label="Create issue" render={<a aria-label="Create issue" href="/create" />}>
      <PlusIcon />
    </IconButton>,
  );
  const link = screen.getByRole("button", { name: "Create issue" });

  await expect.element(link).toHaveAttribute("href", "/create");
  await expect.poll(() => getComputedStyle(link.element()).width).toBe("24px");
  const icon = link.element().querySelector<HTMLElement>('[data-slot="icon-button-icon"]');
  expect(icon?.getBoundingClientRect().toJSON()).toMatchObject({ height: 14, width: 14 });
  expect(icon?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
});

test("Icon Button exposes selected toggle semantics", async () => {
  const screen = await render(
    <IconButton aria-label="Pin issue" selected variant="ghost">
      <PlusIcon />
    </IconButton>,
  );
  const button = screen.getByRole("button", { name: "Pin issue" });

  await expect.element(button).toHaveAttribute("aria-pressed", "true");
  await expect.element(button).toHaveAttribute("data-selected", "true");
  await expect
    .poll(() => getComputedStyle(button.element()).backgroundColor)
    .toBe("rgb(255, 255, 255)");
});

test("Label preserves Base UI render composition and marker customization", async () => {
  const screen = await render(
    <Label
      color="violet"
      marker={<span data-testid="custom-marker">◆</span>}
      render={<a aria-label="Feature" href="/issues" />}
    >
      Feature
    </Label>,
  );
  const link = screen.getByRole("button", { name: "Feature" });

  await expect.element(link).toHaveAttribute("href", "/issues");
  await expect.poll(() => getComputedStyle(link.element()).height).toBe("25px");
  expect(link.element().querySelector('[data-slot="label-marker"]')).not.toBeNull();
  await expect.element(screen.getByTestId("custom-marker")).toBeVisible();
});

test("Label resolves open and dark theme states through semantic tokens", async () => {
  const screen = await render(
    <ThemeScope theme="dark">
      <Label color="blue" open>
        Feature
      </Label>
    </ThemeScope>,
  );
  const label = screen.getByRole("button", { name: "Feature" });
  const marker = label.element().querySelector<HTMLElement>('[data-slot="label-marker"]');

  await expect.element(label).toHaveAttribute("aria-expanded", "true");
  await expect
    .poll(() => getComputedStyle(label.element()).backgroundColor)
    .toBe("rgb(40, 41, 43)");
  expect(getComputedStyle(label.element()).color).toBe("rgb(255, 255, 255)");
  expect(getComputedStyle(marker!).backgroundColor).toBe("rgb(78, 167, 252)");
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
      <Label color="violet">Feature</Label>
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
