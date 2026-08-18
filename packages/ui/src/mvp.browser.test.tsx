import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "virtual:stylex:runtime";

import { semanticTokenNames } from "@lenso/tokens";

import "../../tokens/src/styles.css";
import { Avatar } from "./avatar/index.js";
import { Button } from "./button/index.js";
import { Breadcrumb } from "./breadcrumb/index.js";
import { Checkbox } from "./checkbox/index.js";
import { Combobox } from "./combobox/index.js";
import { CommandMenu } from "./command-menu/index.js";
import { Dialog } from "./dialog/index.js";
import { Disclosure } from "./disclosure/index.js";
import { IconButton } from "./icon-button/index.js";
import { Label } from "./label/index.js";
import { RadioGroup } from "./radio/index.js";
import { Select } from "./select/index.js";
import { Switch } from "./switch/index.js";
import { TextField } from "./text-field/index.js";
import { ThemeScope } from "./theme-scope/index.js";
import { PlusIcon } from "lucide-react";

test("Avatar falls back after an image error and exposes presence semantics", async () => {
  const screen = await render(
    <main>
      <Avatar.Root size="large">
        <Avatar.Image alt="Lenso member" src="/missing-avatar.png" />
        <Avatar.Fallback>LR</Avatar.Fallback>
        <Avatar.Status attached state="away" />
      </Avatar.Root>
      <Avatar.Group aria-label="Project members">
        <Avatar.Root size="default">
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root size="default">
          <Avatar.Fallback>MK</Avatar.Fallback>
        </Avatar.Root>
      </Avatar.Group>
    </main>,
  );

  await expect.element(screen.getByText("LR")).toBeVisible();
  await expect.element(screen.getByText("away status")).toBeInTheDocument();
  const root = screen.getByText("LR").element().parentElement!;
  expect(root.getBoundingClientRect().width).toBe(32);
  expect(
    getComputedStyle(screen.getByText("away status").element().parentElement!).backgroundColor,
  ).toBe("rgb(138, 90, 0)");
  const accessibility = await axe.run(document.body);
  expect(accessibility.violations).toEqual([]);
});

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
  expect(spinner?.getBoundingClientRect().toJSON()).toMatchObject({
    height: 10,
    width: 10,
  });
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
  expect(icon?.getBoundingClientRect().toJSON()).toMatchObject({
    height: 14,
    width: 14,
  });
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
  await expect.poll(() => getComputedStyle(link.element()).height).toBe("24px");
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

test("Checkbox preserves Base UI keyboard, form, and indeterminate semantics", async () => {
  const onCheckedChange = vi.fn();
  const screen = await render(
    <form>
      <Checkbox.Root defaultChecked={false} name="completed" onCheckedChange={onCheckedChange}>
        <Checkbox.Indicator />
        <Checkbox.Label>Include completed issues</Checkbox.Label>
      </Checkbox.Root>
      <Checkbox.Root indeterminate>
        <Checkbox.Indicator />
        <Checkbox.Label>Select all issues</Checkbox.Label>
      </Checkbox.Root>
    </form>,
  );
  const checkbox = screen.getByRole("checkbox", {
    name: "Include completed issues",
  });
  const mixed = screen.getByRole("checkbox", { name: "Select all issues" });

  await expect.element(checkbox).not.toBeChecked();
  await checkbox.click();
  await expect.element(checkbox).toBeChecked();
  expect(onCheckedChange).toHaveBeenCalledOnce();
  checkbox.element().focus();
  await userEvent.keyboard(" ");
  await expect.element(checkbox).not.toBeChecked();
  await expect.element(mixed).toHaveAttribute("aria-checked", "mixed");
  expect(
    checkbox.element().parentElement?.querySelector<HTMLInputElement>('input[name="completed"]'),
  ).not.toBeNull();
});

test("Checkbox permits a consumer-owned indicator", async () => {
  const screen = await render(
    <Checkbox.Root defaultChecked>
      <Checkbox.Indicator>
        <span data-testid="custom-checkbox-mark">Custom</span>
      </Checkbox.Indicator>
      <Checkbox.Label>Custom selection</Checkbox.Label>
    </Checkbox.Root>,
  );
  await expect.element(screen.getByTestId("custom-checkbox-mark")).toBeVisible();
  expect(
    getComputedStyle(
      screen
        .getByRole("checkbox", { name: "Custom selection" })
        .element()
        .querySelector('[data-slot="checkbox-indicator"]')!,
      "::after",
    ).content,
  ).toBe("none");
});

test("Radio preserves grouped selection, keyboard navigation, and form semantics", async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <form>
      <RadioGroup.Root defaultValue="compact" name="density" onValueChange={onValueChange}>
        <RadioGroup.Item value="compact">
          <RadioGroup.Indicator />
          Compact
        </RadioGroup.Item>
        <RadioGroup.Item value="comfortable">
          <RadioGroup.Indicator />
          Comfortable
        </RadioGroup.Item>
      </RadioGroup.Root>
    </form>,
  );
  const compact = screen.getByRole("radio", { name: "Compact" });
  const comfortable = screen.getByRole("radio", { name: "Comfortable" });

  await expect.element(compact).toBeChecked();
  await expect.element(comfortable).not.toBeChecked();
  compact.element().focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(comfortable).toBeChecked();
  expect(onValueChange).toHaveBeenCalledWith("comfortable", expect.anything());
  expect(
    comfortable.element().parentElement?.querySelector<HTMLInputElement>('input[name="density"]'),
  ).not.toBeNull();
});

test("Radio permits a consumer-owned selection indicator", async () => {
  const screen = await render(
    <RadioGroup.Root defaultValue="custom">
      <RadioGroup.Item value="custom">
        <RadioGroup.Indicator>
          <span data-testid="custom-radio-mark">Custom</span>
        </RadioGroup.Indicator>
        Custom option
      </RadioGroup.Item>
    </RadioGroup.Root>,
  );
  await expect.element(screen.getByTestId("custom-radio-mark")).toBeVisible();
  expect(
    getComputedStyle(
      screen
        .getByRole("radio", { name: "Custom option" })
        .element()
        .querySelector('[data-slot="radio-group-indicator"]')!,
      "::after",
    ).content,
  ).toBe("none");
});

test("Switch toggles, submits its value, and permits a consumer-owned thumb", async () => {
  const onCheckedChange = vi.fn();
  const screen = await render(
    <form>
      <Switch.Root name="notifications" onCheckedChange={onCheckedChange} value="enabled">
        <Switch.Thumb>
          <span data-testid="custom-switch-thumb">Custom</span>
        </Switch.Thumb>
        Notifications
      </Switch.Root>
    </form>,
  );
  const control = screen.getByRole("switch", { name: "Notifications" });
  await expect.element(control).not.toBeChecked();
  await control.click();
  await expect.element(control).toBeChecked();
  expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  await expect.element(screen.getByTestId("custom-switch-thumb")).toBeVisible();
  expect(
    control.element().parentElement?.querySelector<HTMLInputElement>('input[name="notifications"]')
      ?.value,
  ).toBe("enabled");
});

test("Switch checked hover keeps the thumb's right edge anchored", async () => {
  const screen = await render(
    <div>
      <Switch.Root aria-label="Default switch" defaultChecked>
        <Switch.Thumb />
      </Switch.Root>
      <Switch.Root aria-label="Compact switch" defaultChecked size="compact">
        <Switch.Thumb />
      </Switch.Root>
    </div>,
  );

  for (const [name, width] of [
    ["Default switch", "16px"],
    ["Compact switch", "12px"],
  ] as const) {
    const control = screen.getByRole("switch", { name });
    const thumb = control.element().querySelector<HTMLElement>('[data-slot="switch-thumb"]')!;
    const resting = thumb.getBoundingClientRect();

    await control.hover();
    await expect.poll(() => getComputedStyle(thumb).width).toBe(width);

    const hovered = thumb.getBoundingClientRect();
    expect(hovered.right).toBeCloseTo(resting.right, 4);
    expect(hovered.left).toBeCloseTo(resting.left - 2, 4);
    await control.unhover();
  }
});

test("Switch consumes hover expansion after a toggle until the pointer leaves", async () => {
  const screen = await render(
    <div>
      <Switch.Root aria-label="Default switch">
        <Switch.Thumb />
      </Switch.Root>
      <Switch.Root aria-label="Compact switch" size="compact">
        <Switch.Thumb />
      </Switch.Root>
    </div>,
  );

  for (const [name, expandedWidth, restingWidth] of [
    ["Default switch", "16px", "14px"],
    ["Compact switch", "12px", "10px"],
  ] as const) {
    const control = screen.getByRole("switch", { name });
    const thumb = control.element().querySelector<HTMLElement>('[data-slot="switch-thumb"]')!;

    await control.hover();
    await expect.poll(() => getComputedStyle(thumb).width).toBe(expandedWidth);
    await control.click();
    await expect.element(control).toBeChecked();
    await expect.poll(() => getComputedStyle(thumb).width).toBe(restingWidth);

    await control.unhover();
    await control.hover();
    await expect.poll(() => getComputedStyle(thumb).width).toBe(expandedWidth);
    await control.unhover();
  }
});

test("Switch animates the consumed hover width during thumb movement", async () => {
  const screen = await render(
    <Switch.Root aria-label="Animated switch">
      <Switch.Thumb />
    </Switch.Root>,
  );
  const control = screen.getByRole("switch", { name: "Animated switch" });
  const thumb = control.element().querySelector<HTMLElement>('[data-slot="switch-thumb"]')!;
  const widthTransitionEvents: string[] = [];

  thumb.addEventListener("transitionrun", (event) => {
    if (event.propertyName === "width") widthTransitionEvents.push("run");
  });
  thumb.addEventListener("transitionend", (event) => {
    if (event.propertyName === "width") widthTransitionEvents.push("end");
  });

  await control.hover();
  await expect.poll(() => getComputedStyle(thumb).width).toBe("16px");
  widthTransitionEvents.length = 0;

  await control.click();
  await expect.element(control).toBeChecked();
  await expect.poll(() => widthTransitionEvents.includes("run")).toBe(true);
  await expect.poll(() => widthTransitionEvents.includes("end")).toBe(true);
  expect(getComputedStyle(thumb).transitionProperty).toContain("width");
  expect(getComputedStyle(thumb).transitionProperty).toContain("transform");
  await expect.poll(() => getComputedStyle(thumb).width).toBe("14px");
});

test("Switch replays hover expansion before consuming it on a second toggle", async () => {
  const screen = await render(
    <div>
      <Switch.Root aria-label="Default switch">
        <Switch.Thumb />
      </Switch.Root>
      <Switch.Root aria-label="Compact switch" size="compact">
        <Switch.Thumb />
      </Switch.Root>
    </div>,
  );

  for (const [name, expandedWidth, restingWidth, innerAnchor] of [
    ["Default switch", "16px", "14px", "7px"],
    ["Compact switch", "12px", "10px", "6px"],
  ] as const) {
    const control = screen.getByRole("switch", { name });
    const thumb = control.element().querySelector<HTMLElement>('[data-slot="switch-thumb"]')!;
    const animationEnds: string[] = [];

    thumb.addEventListener("animationend", () => {
      animationEnds.push(getComputedStyle(thumb).width);
    });

    await control.hover();
    await expect.poll(() => getComputedStyle(thumb).width).toBe(expandedWidth);
    await control.click();
    await expect.element(control).toBeChecked();
    await expect.poll(() => getComputedStyle(thumb).width).toBe(restingWidth);

    animationEnds.length = 0;
    await control.click();
    await expect.element(control).not.toBeChecked();
    await expect
      .poll(() => thumb.getAnimations().some((animation) => "animationName" in animation))
      .toBe(true);
    const feedbackAnimation = thumb
      .getAnimations()
      .find((animation) => "animationName" in animation);
    if (!feedbackAnimation) throw new Error("Switch feedback animation did not start");
    feedbackAnimation.pause();
    feedbackAnimation.currentTime = 90;
    expect(getComputedStyle(thumb).width).toBe(expandedWidth);
    expect(getComputedStyle(thumb).left).toBe(innerAnchor);
    feedbackAnimation.play();
    await expect.poll(() => animationEnds.length).toBe(1);
    expect(animationEnds).toEqual([restingWidth]);
    expect(getComputedStyle(thumb).width).toBe(restingWidth);
    await control.unhover();
  }
});

test("Switch anchors the reverse replay on the inner edge", async () => {
  const screen = await render(
    <div>
      <Switch.Root aria-label="Default reverse switch" defaultChecked>
        <Switch.Thumb />
      </Switch.Root>
      <Switch.Root aria-label="Compact reverse switch" defaultChecked size="compact">
        <Switch.Thumb />
      </Switch.Root>
    </div>,
  );

  for (const [name, expandedWidth, restingWidth, innerAnchor] of [
    ["Default reverse switch", "16px", "14px", "7px"],
    ["Compact reverse switch", "12px", "10px", "6px"],
  ] as const) {
    const control = screen.getByRole("switch", { name });
    const thumb = control.element().querySelector<HTMLElement>('[data-slot="switch-thumb"]')!;

    await control.hover();
    await expect.poll(() => getComputedStyle(thumb).width).toBe(expandedWidth);
    await control.click();
    await expect.element(control).not.toBeChecked();
    await expect.poll(() => getComputedStyle(thumb).width).toBe(restingWidth);

    const animationStarted = new Promise<Animation>((resolve) => {
      const handleAnimationStart = (event: AnimationEvent) => {
        const animation = thumb.getAnimations().find((candidate) => {
          if (!("animationName" in candidate)) return false;
          return candidate.animationName === event.animationName;
        });
        if (!animation) return;
        thumb.removeEventListener("animationstart", handleAnimationStart);
        resolve(animation);
      };
      thumb.addEventListener("animationstart", handleAnimationStart);
    });
    await control.click();
    await expect.element(control).toBeChecked();
    const feedbackAnimation = await animationStarted;
    feedbackAnimation.pause();
    feedbackAnimation.currentTime = 90;
    expect(getComputedStyle(thumb).width).toBe(expandedWidth);
    expect(getComputedStyle(thumb).left).toBe(innerAnchor);
    feedbackAnimation.play();
    await expect.poll(() => getComputedStyle(thumb).width).toBe(restingWidth);
    await control.unhover();
  }
});

test("Select supports keyboard selection, form semantics, and focus restoration", async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <form>
      <Select.Root defaultValue="small" name="density" onValueChange={onValueChange}>
        <Select.Trigger aria-label="Density">
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              <Select.List>
                <Select.Item label="Small" value="small">
                  <Select.ItemText>Small</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
                <Select.Item label="Default" value="default">
                  <Select.ItemText>Default</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </form>,
  );
  const trigger = screen.getByRole("combobox");
  trigger.element().focus();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(screen.getByRole("listbox")).toBeVisible();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  await expect.element(trigger).toHaveTextContent("default");
  expect(onValueChange).toHaveBeenCalledWith("default", expect.anything());
  expect(document.activeElement).toBe(trigger.element());
  expect(document.querySelector<HTMLInputElement>('input[name="density"]')?.value).toBe("default");
});

test("Select permits consumer-owned icon and selection indicator", async () => {
  const screen = await render(
    <Select.Root defaultOpen defaultValue="custom">
      <Select.Trigger>
        <Select.Value />
        <Select.Icon>
          <span data-testid="custom-select-icon">Icon</span>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              <Select.Item value="custom">
                <Select.ItemText>Custom</Select.ItemText>
                <Select.ItemIndicator>
                  <span data-testid="custom-select-indicator">Chosen</span>
                </Select.ItemIndicator>
              </Select.Item>
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>,
  );
  await expect.element(screen.getByTestId("custom-select-icon")).toBeVisible();
  await expect.element(screen.getByTestId("custom-select-indicator")).toBeVisible();
});

test("Combobox filters and selects with keyboard while preserving focus", async () => {
  const onValueChange = vi.fn();
  const screen = await render(
    <Combobox.Root items={["Bug", "Feature", "Improvement"]} onValueChange={onValueChange}>
      <Combobox.InputGroup>
        <Combobox.Input aria-label="Labels" placeholder="Change or add labels…" />
        <Combobox.Shortcut>L</Combobox.Shortcut>
      </Combobox.InputGroup>
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.Empty>No labels found</Combobox.Empty>
            <Combobox.List>
              {(label: string) => (
                <Combobox.Item key={label} value={label}>
                  {label}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>,
  );
  const input = screen.getByRole("combobox", { name: "Labels" });
  await input.fill("fea");
  await expect.element(screen.getByRole("option", { name: "Feature" })).toBeVisible();
  expect(
    Array.from(document.querySelectorAll('[role="option"]')).some(
      (option) => option.textContent === "Bug",
    ),
  ).toBe(false);
  await userEvent.keyboard("{ArrowDown}{Enter}");
  expect(onValueChange).toHaveBeenCalledWith("Feature", expect.anything());
  expect((input.element() as HTMLInputElement).value).toBe("");
  expect(document.activeElement).toBe(input.element());
  const results = await axe.run(screen.container);
  expect(results.violations).toEqual([]);
});

test("Combobox permits consumer-owned selection visuals", async () => {
  const screen = await render(
    <Combobox.Root defaultOpen defaultValue="Custom" items={["Custom"]}>
      <Combobox.Input aria-label="Custom label" />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Popup>
            <Combobox.List>
              {(label: string) => (
                <Combobox.Item key={label} value={label}>
                  <Combobox.ItemIndicator>
                    <span data-testid="custom-combobox-indicator">Chosen</span>
                  </Combobox.ItemIndicator>
                  {label}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>,
  );
  await expect.element(screen.getByTestId("custom-combobox-indicator")).toBeVisible();
});

test("Command Menu filters commands and preserves keyboard navigation", async () => {
  const onValueChange = vi.fn();
  const commands = ["Assign to…", "Change status…", "Set priority…"];
  const screen = await render(
    <main>
      <CommandMenu.Root items={commands} onValueChange={onValueChange}>
        <CommandMenu.Panel>
          <CommandMenu.Search>
            <CommandMenu.Input aria-label="Command search" />
          </CommandMenu.Search>
          <CommandMenu.GroupLabel>Commands</CommandMenu.GroupLabel>
          <CommandMenu.List>
            {(command: string) => (
              <CommandMenu.Item key={command} value={command}>
                <CommandMenu.ItemIcon>
                  <PlusIcon />
                </CommandMenu.ItemIcon>
                <CommandMenu.ItemText>{command}</CommandMenu.ItemText>
                <CommandMenu.Shortcut>S</CommandMenu.Shortcut>
              </CommandMenu.Item>
            )}
          </CommandMenu.List>
          <CommandMenu.Empty>No commands found</CommandMenu.Empty>
        </CommandMenu.Panel>
      </CommandMenu.Root>
    </main>,
  );

  const input = screen.getByRole("combobox", { name: "Command search" });
  await input.fill("status");
  await expect.element(screen.getByText("Change status…")).toBeVisible();
  await expect.element(screen.getByText("Assign to…")).not.toBeInTheDocument();
  input.element().focus();
  await userEvent.keyboard("{ArrowDown}{Enter}");
  expect(onValueChange).toHaveBeenCalledWith("Change status…", expect.anything());
  const accessibility = await axe.run(document.body);
  expect(accessibility.violations).toEqual([]);
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

test("Disclosure coordinates single expansion and keyboard activation", async () => {
  const screen = await render(
    <Disclosure.Root defaultValue={["workspace"]}>
      <Disclosure.Item value="workspace">
        <Disclosure.Header>
          <Disclosure.Trigger>
            Workspace <Disclosure.Icon />
          </Disclosure.Trigger>
        </Disclosure.Header>
        <Disclosure.Panel>Workspace content</Disclosure.Panel>
      </Disclosure.Item>
      <Disclosure.Item value="projects">
        <Disclosure.Header>
          <Disclosure.Trigger>
            Projects <Disclosure.Icon />
          </Disclosure.Trigger>
        </Disclosure.Header>
        <Disclosure.Panel>Projects content</Disclosure.Panel>
      </Disclosure.Item>
    </Disclosure.Root>,
  );
  const workspace = screen.getByRole("button", { name: "Workspace" });
  const projects = screen.getByRole("button", { name: "Projects" });
  await expect.element(workspace).toHaveAttribute("aria-expanded", "true");
  projects.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(projects).toHaveAttribute("aria-expanded", "true");
  await expect.element(workspace).toHaveAttribute("aria-expanded", "false");
  expect((await axe.run(document.body)).violations).toEqual([]);
});

test("the MVP foundation surface has no automatic accessibility violations", async () => {
  await render(
    <main>
      <Button>Continue</Button>
      <Disclosure.Root defaultValue={["workspace"]}>
        <Disclosure.Item value="workspace">
          <Disclosure.Header>
            <Disclosure.Trigger>
              Workspace <Disclosure.Icon />
            </Disclosure.Trigger>
          </Disclosure.Header>
          <Disclosure.Panel>Projects and workspace views.</Disclosure.Panel>
        </Disclosure.Item>
      </Disclosure.Root>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link>Workspace</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Issues</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <Label color="violet">Feature</Label>
      <Checkbox.Root defaultChecked>
        <Checkbox.Indicator />
        <Checkbox.Label>Include completed issues</Checkbox.Label>
      </Checkbox.Root>
      <RadioGroup.Root defaultValue="compact">
        <RadioGroup.Item value="compact">
          <RadioGroup.Indicator />
          Compact
        </RadioGroup.Item>
      </RadioGroup.Root>
      <Switch.Root defaultChecked>
        <Switch.Thumb />
        Notifications
      </Switch.Root>
      <Select.Root defaultValue="small">
        <Select.Trigger aria-label="Density">
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              <Select.List>
                <Select.Item value="small">
                  <Select.ItemText>Small</Select.ItemText>
                  <Select.ItemIndicator />
                </Select.Item>
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
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
