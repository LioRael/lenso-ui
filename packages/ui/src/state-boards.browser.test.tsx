import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../tokens/src/styles.css";
import { Button } from "./button/index.js";
import { Checkbox } from "./checkbox/index.js";
import { Dialog } from "./dialog/index.js";
import { IconButton } from "./icon-button/index.js";
import { Label } from "./label/index.js";
import { RadioGroup } from "./radio/index.js";
import { Switch } from "./switch/index.js";
import { TextField } from "./text-field/index.js";
import { ThemeScope } from "./theme-scope/index.js";
import { PlusIcon } from "lucide-react";

const screenshotOptions = {
  comparatorName: "pixelmatch" as const,
  // Chromium's bundled fonts are rasterized differently on Linux and macOS.
  // Exact theme values and component geometry are asserted separately above.
  comparatorOptions: { allowedMismatchedPixelRatio: 0.04 },
};

const figmaButtonStates = [
  { name: "default", x: 96 },
  { name: "hover", x: 208 },
  { name: "pressed", x: 320 },
  { name: "focus-visible", x: 432 },
  { name: "disabled", x: 544 },
] as const;

const figmaButtonGroups = [
  { label: "Continue", size: "compact", variant: "primary", y: 16 },
  { label: "Continue", size: "default", variant: "primary", y: 70 },
  { label: "Cancel", size: "compact", variant: "secondary", y: 178 },
  { label: "Cancel", size: "default", variant: "secondary", y: 232 },
  { label: "More", size: "compact", variant: "ghost", y: 340 },
  { label: "More", size: "default", variant: "ghost", y: 394 },
] as const;

test("Button matches the approved Figma state board", async () => {
  const screen = await render(
    <div
      data-testid="button-state-board"
      style={{
        background: "#ececed",
        height: 442,
        position: "relative",
        width: 640,
      }}
    >
      {figmaButtonGroups.flatMap((group) =>
        figmaButtonStates.map((state) => (
          <Button
            data-visual-state={state.name === "default" ? undefined : state.name}
            disabled={state.name === "disabled"}
            key={`${group.variant}-${group.size}-${state.name}`}
            size={group.size}
            style={{ left: state.x, position: "absolute", top: group.y }}
            variant={group.variant}
          >
            {group.label}
          </Button>
        )),
      )}
    </div>,
  );

  await document.fonts.load('500 11px "IBM Plex Sans"', "Continue Cancel More");
  await expect.poll(() => document.fonts.check('500 11px "IBM Plex Sans"')).toBe(true);

  const board = screen.getByTestId("button-state-board");
  const buttons = board.element().querySelectorAll<HTMLButtonElement>('[data-slot="button"]');
  expect(buttons).toHaveLength(30);
  await expect.poll(() => getComputedStyle(buttons[0]!).height).toBe("28px");
  await expect.poll(() => getComputedStyle(buttons[5]!).height).toBe("32px");
  await expect.poll(() => getComputedStyle(buttons[0]!).backgroundColor).toBe("rgb(40, 42, 48)");
  expect(getComputedStyle(buttons[0]!).fontFamily).toContain("IBM Plex Sans");
  expect(getComputedStyle(buttons[0]!).fontSize).toBe("11px");
  expect(getComputedStyle(buttons[5]!).fontSize).toBe("12px");
  expect(getComputedStyle(buttons[0]!).fontWeight).toBe("500");
  expect(getComputedStyle(buttons[0]!).paddingInline).toBe("12px");
  expect(getComputedStyle(buttons[0]!).borderWidth).toBe("0px");
  expect(getComputedStyle(buttons[10]!).boxShadow).toContain("0.5px");
  expect(getComputedStyle(buttons[1]!).backgroundColor).toBe("rgb(31, 32, 36)");
  expect(getComputedStyle(buttons[10]!).backgroundColor).toBe("rgb(255, 255, 255)");
  expect(getComputedStyle(buttons[11]!).backgroundColor).toBe("rgb(240, 240, 240)");
  expect(getComputedStyle(buttons[20]!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(buttons[21]!).backgroundColor).toBe("rgb(238, 237, 240)");
  expect(getComputedStyle(buttons[4]!).opacity).toBe("0.5");

  const pressedLayer = buttons[2]?.querySelector<HTMLElement>('[data-slot="button-state-layer"]');
  const focusLayer = buttons[3]?.querySelector<HTMLElement>('[data-slot="button-state-layer"]');
  expect(getComputedStyle(pressedLayer!).backgroundColor).toBe("rgba(0, 0, 0, 0.08)");
  expect(getComputedStyle(focusLayer!).borderColor).toBe("rgb(94, 106, 210)");
  expect(pressedLayer?.getBoundingClientRect().toJSON()).toMatchObject(
    buttons[2]?.getBoundingClientRect().toJSON() ?? {},
  );
  for (const [index, width, height] of [
    [0, 70, 28],
    [5, 74, 32],
    [10, 59, 28],
    [15, 62, 32],
    [20, 50, 28],
    [25, 52, 32],
  ] as const) {
    const rect = buttons[index]?.getBoundingClientRect();
    expect(rect?.height).toBe(height);
    expect(Math.abs((rect?.width ?? 0) - width)).toBeLessThan(1);
  }

  await expect.element(board).toMatchScreenshot("button-figma-state-board", {
    comparatorName: "pixelmatch",
    // The canonical Figma PNG is resampled to Vitest Browser's 0.8 raster scale.
    // Solid fills and geometry are asserted separately to keep this tolerance from hiding drift.
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});

const figmaIconButtonStates = [
  { name: "default", x: 96 },
  { name: "hover", x: 176 },
  { name: "pressed", x: 256 },
  { name: "focus-visible", x: 336 },
  { name: "selected", x: 416 },
  { name: "disabled", x: 496 },
] as const;

const figmaIconButtonGroups = [
  { size: "compact", variant: "secondary", y: 16 },
  { size: "default", variant: "secondary", y: 70 },
  { size: "compact", variant: "ghost", y: 178 },
  { size: "default", variant: "ghost", y: 232 },
] as const;

test("Icon Button matches the approved Figma state board", async () => {
  const screen = await render(
    <div
      data-testid="icon-button-state-board"
      style={{
        background: "#ececed",
        height: 280,
        position: "relative",
        width: 1296,
      }}
    >
      {figmaIconButtonGroups.flatMap((group) =>
        figmaIconButtonStates.map((state) => (
          <IconButton
            aria-label={`${group.variant} ${group.size} ${state.name}`}
            data-visual-state={
              state.name === "default" || state.name === "selected" ? undefined : state.name
            }
            disabled={state.name === "disabled"}
            key={`${group.variant}-${group.size}-${state.name}`}
            selected={state.name === "selected"}
            size={group.size}
            style={{ left: state.x, position: "absolute", top: group.y }}
            variant={group.variant}
          >
            <PlusIcon />
          </IconButton>
        )),
      )}
    </div>,
  );

  const board = screen.getByTestId("icon-button-state-board");
  const buttons = board.element().querySelectorAll<HTMLButtonElement>('[data-slot="icon-button"]');
  expect(buttons).toHaveLength(24);
  await expect.poll(() => getComputedStyle(buttons[0]!).height).toBe("24px");
  expect(getComputedStyle(buttons[6]!).height).toBe("28px");
  expect(getComputedStyle(buttons[0]!).width).toBe("24px");
  expect(getComputedStyle(buttons[6]!).width).toBe("28px");
  expect(getComputedStyle(buttons[0]!).backgroundColor).toBe("rgb(255, 255, 255)");
  expect(getComputedStyle(buttons[1]!).backgroundColor).toBe("rgb(240, 240, 240)");
  expect(getComputedStyle(buttons[12]!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(buttons[13]!).backgroundColor).toBe("rgb(238, 237, 240)");
  expect(getComputedStyle(buttons[16]!).backgroundColor).toBe("rgb(255, 255, 255)");
  expect(getComputedStyle(buttons[5]!).opacity).toBe("0.5");
  expect(buttons[4]!.getAttribute("aria-pressed")).toBe("true");

  const icon = buttons[0]?.querySelector<HTMLElement>('[data-slot="icon-button-icon"]');
  const pressedLayer = buttons[2]?.querySelector<HTMLElement>(
    '[data-slot="icon-button-state-layer"]',
  );
  const focusLayer = buttons[3]?.querySelector<HTMLElement>(
    '[data-slot="icon-button-state-layer"]',
  );
  expect(icon?.getBoundingClientRect().toJSON()).toMatchObject({
    height: 14,
    width: 14,
  });
  expect(getComputedStyle(pressedLayer!).backgroundColor).toBe("rgba(0, 0, 0, 0.08)");
  expect(getComputedStyle(focusLayer!).borderColor).toBe("rgb(94, 106, 210)");

  await expect.element(board).toMatchScreenshot("icon-button-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});

const figmaLabelStates = [
  { name: "default", x: 0 },
  { name: "hover", x: 81 },
  { name: "active", x: 162 },
  { name: "open", x: 243 },
] as const;

const figmaLabelGroups = [
  { color: "red", y: 0 },
  { color: "violet", y: 41 },
  { color: "blue", y: 82 },
] as const;

test("Label matches the approved Figma state board", async () => {
  const screen = await render(
    <div
      data-testid="label-state-board"
      style={{
        background: "#ececed",
        height: 107,
        position: "relative",
        width: 310,
      }}
    >
      {figmaLabelGroups.flatMap((group) =>
        figmaLabelStates.map((state) => (
          <Label
            color={group.color}
            data-visual-state={state.name === "default" ? undefined : state.name}
            key={`${group.color}-${state.name}`}
            open={state.name === "open"}
            style={{ left: state.x, position: "absolute", top: group.y }}
          >
            Label
          </Label>
        )),
      )}
    </div>,
  );

  await document.fonts.load('500 13px "Inter"', "Label");
  await expect.poll(() => document.fonts.check('500 13px "Inter"')).toBe(true);

  const board = screen.getByTestId("label-state-board");
  const labels = board.element().querySelectorAll<HTMLButtonElement>('[data-slot="label"]');
  expect(labels).toHaveLength(12);
  await expect.poll(() => getComputedStyle(labels[0]!).height).toBe("25px");
  expect(Math.abs(labels[0]!.getBoundingClientRect().width - 65)).toBeLessThan(1);
  expect(getComputedStyle(labels[0]!).backgroundColor).toBe("rgb(248, 248, 249)");
  expect(getComputedStyle(labels[1]!).backgroundColor).toBe("rgb(236, 236, 237)");
  expect(getComputedStyle(labels[3]!).backgroundColor).toBe("rgb(240, 240, 241)");
  expect(getComputedStyle(labels[0]!).boxShadow).toContain("rgb(222, 222, 222)");
  expect(getComputedStyle(labels[0]!).fontFamily).toContain("Inter");
  expect(getComputedStyle(labels[0]!).fontSize).toBe("13px");
  expect(getComputedStyle(labels[0]!).lineHeight).toBe("15.5px");

  const markers = Array.from(labels, (label) =>
    label.querySelector<HTMLElement>('[data-slot="label-marker"]'),
  );
  expect(markers[0]?.getBoundingClientRect().toJSON()).toMatchObject({
    height: 9,
    width: 9,
  });
  expect(getComputedStyle(markers[0]!).backgroundColor).toBe("rgb(235, 87, 87)");
  expect(getComputedStyle(markers[4]!).backgroundColor).toBe("rgb(187, 135, 252)");
  expect(getComputedStyle(markers[8]!).backgroundColor).toBe("rgb(78, 167, 252)");

  await expect.element(board).toMatchScreenshot("label-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});

const figmaTextFieldStates = [
  { name: "default", x: 0, y: 24 },
  { name: "hover", x: 320, y: 24 },
  { name: "active", x: 640, y: 24 },
  { name: "focus-visible", x: 960, y: 24 },
  { name: "error", x: 0, y: 136 },
  { name: "read-only", x: 320, y: 136 },
  { name: "disabled", x: 640, y: 136 },
] as const;

test("Text Field matches the approved Figma state board", async () => {
  const screen = await render(
    <ThemeScope theme="light">
      <div
        data-testid="text-field-figma-state-board"
        style={{
          background: "#ececed",
          height: 232,
          position: "relative",
          width: 1296,
        }}
      >
        {figmaTextFieldStates.map((state) => {
          const invalid = state.name === "error";
          return (
            <TextField.Root
              disabled={state.name === "disabled"}
              invalid={invalid}
              key={state.name}
              style={{
                left: state.x,
                position: "absolute",
                top: state.y,
                width: 304,
              }}
            >
              <TextField.Label>Field label</TextField.Label>
              <TextField.Control
                data-visual-state={
                  state.name === "hover" ||
                  state.name === "active" ||
                  state.name === "focus-visible"
                    ? state.name
                    : undefined
                }
                placeholder="Enter value"
                readOnly={state.name === "read-only"}
              />
              {invalid ? (
                <TextField.Error match>Resolve this field before continuing.</TextField.Error>
              ) : (
                <TextField.Description>
                  {state.name === "active" || state.name === "focus-visible"
                    ? "Ready for input."
                    : "Optional supporting text."}
                </TextField.Description>
              )}
            </TextField.Root>
          );
        })}
      </div>
    </ThemeScope>,
  );

  await document.fonts.load('500 13px "Inter"', "Field label");
  await document.fonts.load('400 13px "Inter"', "Enter value");
  const board = screen.getByTestId("text-field-figma-state-board");
  const fields = board.element().querySelectorAll<HTMLElement>('[data-slot="text-field"]');
  const controls = board
    .element()
    .querySelectorAll<HTMLInputElement>('[data-slot="text-field-control"]');
  expect(fields).toHaveLength(7);
  expect(controls).toHaveLength(7);
  expect(fields[0]?.getBoundingClientRect().toJSON()).toMatchObject({
    height: 80,
    width: 304,
  });
  expect(controls[0]?.getBoundingClientRect().toJSON()).toMatchObject({
    height: 32,
    width: 304,
  });
  // Chromium rasterizes subpixel borders to the device pixel grid; the source token remains 0.5px.
  expect(getComputedStyle(controls[0]!).borderStyle).toBe("solid");
  expect(getComputedStyle(controls[0]!).borderColor).toBe("rgb(212, 212, 212)");
  expect(getComputedStyle(controls[1]!).borderColor).toBe("rgb(112, 113, 114)");
  expect(getComputedStyle(controls[2]!).outlineColor).toBe("rgb(94, 106, 210)");
  expect(getComputedStyle(controls[3]!).outlineColor).toBe("rgb(94, 106, 210)");
  expect(getComputedStyle(controls[4]!).borderColor).toBe("rgb(220, 38, 38)");
  expect(getComputedStyle(controls[5]!).backgroundColor).toBe("rgb(250, 250, 250)");
  expect(getComputedStyle(controls[5]!).borderColor).toBe("rgb(234, 234, 234)");
  expect(getComputedStyle(controls[6]!).backgroundColor).toBe("rgb(255, 255, 255)");
  expect(getComputedStyle(controls[6]!).borderColor).toBe("rgb(234, 234, 234)");

  await expect.element(board).toMatchScreenshot("text-field-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});

test("Text Field resolves dark theme values", async () => {
  const screen = await render(
    <ThemeScope theme="dark">
      <TextField.Root>
        <TextField.Label>Field label</TextField.Label>
        <TextField.Control placeholder="Enter value" />
        <TextField.Description>Optional supporting text.</TextField.Description>
      </TextField.Root>
    </ThemeScope>,
  );

  const label = screen.getByText("Field label").element();
  const control = screen.getByPlaceholder("Enter value").element();
  await expect.poll(() => getComputedStyle(label).color).toBe("rgb(247, 248, 248)");
  await expect.poll(() => getComputedStyle(control).backgroundColor).toBe("rgb(0, 0, 0)");
  expect(getComputedStyle(control).borderColor).toBe("rgb(51, 51, 51)");
});

const figmaCheckboxStates = [
  { name: "default", x: 0 },
  { name: "hover", x: 144 },
  { name: "pressed", x: 288 },
  { name: "focus-visible", x: 432 },
  { name: "disabled", x: 576 },
] as const;

const figmaCheckboxValues = [
  { name: "off", y: 24 },
  { name: "on", y: 76 },
  { name: "indeterminate", y: 128 },
] as const;

test("Checkbox matches the approved Figma state board", async () => {
  const screen = await render(
    <div
      data-testid="checkbox-figma-state-board"
      style={{ background: "#ececed", height: 172, position: "relative", width: 800 }}
    >
      {figmaCheckboxValues.flatMap((value) =>
        figmaCheckboxStates.map((state) => (
          <Checkbox.Root
            checked={value.name === "on"}
            data-visual-state={
              state.name === "default" || state.name === "disabled" ? undefined : state.name
            }
            disabled={state.name === "disabled"}
            indeterminate={value.name === "indeterminate"}
            key={`${value.name}-${state.name}`}
            style={{ left: state.x, position: "absolute", top: value.y, width: 120 }}
          >
            <Checkbox.Indicator />
            <Checkbox.Label>Checkbox label</Checkbox.Label>
          </Checkbox.Root>
        )),
      )}
    </div>,
  );

  await document.fonts.load('400 13px "Inter"', "Checkbox label");
  await expect.poll(() => document.fonts.check('400 13px "Inter"')).toBe(true);

  const board = screen.getByTestId("checkbox-figma-state-board");
  const roots = board.element().querySelectorAll<HTMLElement>('[data-slot="checkbox"]');
  const indicators = board
    .element()
    .querySelectorAll<HTMLElement>('[data-slot="checkbox-indicator"]');
  expect(roots).toHaveLength(15);
  expect(indicators).toHaveLength(15);
  expect(roots[0]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 28, width: 120 });
  expect(indicators[0]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 14, width: 14 });
  expect(getComputedStyle(roots[0]!).fontFamily).toContain("Inter");
  expect(getComputedStyle(roots[0]!).fontSize).toBe("13px");
  expect(getComputedStyle(roots[0]!).fontWeight).toBe("400");
  expect(getComputedStyle(roots[0]!).gap).toBe("8px");
  expect(getComputedStyle(indicators[0]!).borderRadius).toBe("3px");
  expect(getComputedStyle(indicators[0]!).boxShadow).toContain("rgb(212, 212, 212)");
  expect(getComputedStyle(indicators[5]!).backgroundColor).toBe("rgb(40, 42, 48)");
  expect(getComputedStyle(indicators[10]!).backgroundColor).toBe("rgb(40, 42, 48)");
  expect(getComputedStyle(indicators[5]!).opacity).toBe("0.9");
  expect(getComputedStyle(roots[4]!).color).toBe("rgb(111, 110, 119)");
  expect(getComputedStyle(indicators[4]!).opacity).toBe("0.5");
  expect(getComputedStyle(indicators[9]!).backgroundColor).toBe("rgb(111, 110, 119)");
  expect(getComputedStyle(indicators[9]!).boxShadow).toBe("none");
  expect(getComputedStyle(indicators[9]!).opacity).toBe("0.45");
  expect(getComputedStyle(indicators[0]!, "::after").content).toBe("none");
  expect(getComputedStyle(indicators[9]!, "::after").display).toBe("none");

  const pressedLayer = indicators[2]?.querySelector<HTMLElement>(
    '[data-slot="checkbox-pressed-layer"]',
  );
  const focusLayer = indicators[3]?.querySelector<HTMLElement>(
    '[data-slot="checkbox-focus-layer"]',
  );
  expect(getComputedStyle(pressedLayer!).backgroundColor).toBe("rgba(0, 0, 0, 0.08)");
  expect(getComputedStyle(focusLayer!).borderColor).toBe("rgb(94, 106, 210)");

  await expect.element(board).toMatchScreenshot("checkbox-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});

test("Checkbox resolves dark theme values", async () => {
  const screen = await render(
    <ThemeScope theme="dark">
      <Checkbox.Root defaultChecked>
        <Checkbox.Indicator />
        <Checkbox.Label>Checkbox label</Checkbox.Label>
      </Checkbox.Root>
    </ThemeScope>,
  );
  const root = screen.getByRole("checkbox", { name: "Checkbox label" }).element();
  const indicator = root.querySelector<HTMLElement>('[data-slot="checkbox-indicator"]');
  await expect.poll(() => getComputedStyle(root).color).toBe("rgb(247, 248, 248)");
  expect(getComputedStyle(indicator!).backgroundColor).toBe("rgb(247, 248, 248)");
  expect(getComputedStyle(indicator!).opacity).toBe("0.9");
  expect(getComputedStyle(indicator!, "::after").backgroundColor).toBe("rgb(0, 0, 0)");
});

const figmaRadioStates = [
  { name: "default", x: 0 },
  { name: "hover", x: 117 },
  { name: "pressed", x: 234 },
  { name: "focus-visible", x: 351 },
  { name: "disabled", x: 468 },
] as const;

const figmaRadioValues = [
  { selected: false, y: 24 },
  { selected: true, y: 76 },
] as const;

test("Radio matches the approved Figma state board", async () => {
  const screen = await render(
    <div
      data-testid="radio-figma-state-board"
      style={{ background: "#ececed", height: 120, position: "relative", width: 650 }}
    >
      {figmaRadioValues.flatMap((value) =>
        figmaRadioStates.map((state) => {
          const radioValue = `${value.selected}-${state.name}`;
          return (
            <RadioGroup.Root
              key={radioValue}
              style={{ left: state.x, position: "absolute", top: value.y }}
              value={value.selected ? radioValue : "other"}
            >
              <RadioGroup.Item
                data-visual-state={state.name === "default" ? undefined : state.name}
                disabled={state.name === "disabled"}
                style={{ width: 93 }}
                value={radioValue}
              >
                <RadioGroup.Indicator />
                Radio label
              </RadioGroup.Item>
            </RadioGroup.Root>
          );
        }),
      )}
    </div>,
  );

  await document.fonts.load('400 13px "Inter"', "Radio label");
  await expect.poll(() => document.fonts.check('400 13px "Inter"')).toBe(true);

  const board = screen.getByTestId("radio-figma-state-board");
  const items = board.element().querySelectorAll<HTMLElement>('[data-slot="radio-group-item"]');
  const indicators = board
    .element()
    .querySelectorAll<HTMLElement>('[data-slot="radio-group-indicator"]');
  expect(items).toHaveLength(10);
  expect(indicators).toHaveLength(10);
  expect(items[0]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 28, width: 93 });
  expect(indicators[0]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 14, width: 14 });
  expect(getComputedStyle(items[0]!).fontFamily).toContain("Inter");
  expect(getComputedStyle(items[0]!).fontSize).toBe("13px");
  expect(getComputedStyle(items[0]!).fontWeight).toBe("400");
  expect(getComputedStyle(items[0]!).gap).toBe("8px");
  expect(getComputedStyle(indicators[0]!).borderRadius).toBe("50%");
  expect(getComputedStyle(indicators[0]!).boxShadow).toContain("rgb(212, 212, 212)");
  expect(getComputedStyle(indicators[5]!).boxShadow).toContain("rgb(40, 42, 48)");
  expect(getComputedStyle(indicators[5]!, "::after").height).toBe("4px");
  expect(getComputedStyle(indicators[5]!, "::after").width).toBe("4px");
  expect(getComputedStyle(items[4]!).color).toBe("rgb(111, 110, 119)");
  expect(getComputedStyle(indicators[9]!, "::after").backgroundColor).toBe("rgb(111, 110, 119)");

  const pressedLayer = indicators[2]?.querySelector<HTMLElement>(
    '[data-slot="radio-group-pressed-layer"]',
  );
  const focusLayer = indicators[3]?.querySelector<HTMLElement>(
    '[data-slot="radio-group-focus-layer"]',
  );
  expect(pressedLayer?.getBoundingClientRect().toJSON()).toMatchObject({ height: 16, width: 16 });
  expect(getComputedStyle(pressedLayer!).backgroundColor).toBe("rgba(0, 0, 0, 0.08)");
  expect(focusLayer?.getBoundingClientRect().toJSON()).toMatchObject({ height: 20, width: 20 });
  expect(getComputedStyle(focusLayer!).borderColor).toBe("rgb(94, 106, 210)");

  await expect.element(board).toMatchScreenshot("radio-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});

test("Radio resolves dark theme values", async () => {
  const screen = await render(
    <ThemeScope theme="dark">
      <RadioGroup.Root defaultValue="compact">
        <RadioGroup.Item value="compact">
          <RadioGroup.Indicator />
          Compact
        </RadioGroup.Item>
      </RadioGroup.Root>
    </ThemeScope>,
  );
  const item = screen.getByRole("radio", { name: "Compact" }).element();
  const indicator = item.querySelector<HTMLElement>('[data-slot="radio-group-indicator"]');
  await expect.poll(() => getComputedStyle(item).color).toBe("rgb(247, 248, 248)");
  expect(getComputedStyle(indicator!).boxShadow).toContain("rgb(247, 248, 248)");
  expect(getComputedStyle(indicator!, "::after").backgroundColor).toBe("rgb(247, 248, 248)");
});

const figmaSwitchStates = [
  { name: "default", x: 0 },
  { name: "hover", x: 143 },
  { name: "pressed", x: 286 },
  { name: "focus-visible", x: 429 },
  { name: "disabled", x: 572 },
] as const;

test("Switch matches the approved Figma state board", async () => {
  const compactStates = [
    { checked: false, x: 0 },
    { checked: false, x: 58 },
    { checked: false, x: 116 },
    { checked: false, x: 174 },
    { checked: false, x: 232 },
    { checked: true, x: 290 },
    { checked: true, x: 348 },
    { checked: true, x: 406 },
    { checked: true, x: 464 },
    { checked: true, x: 522 },
  ] as const;
  const screen = await render(
    <div
      data-testid="switch-figma-state-board"
      style={{ background: "#ececed", height: 178, position: "relative", width: 760 }}
    >
      {[false, true].flatMap((checked, row) =>
        figmaSwitchStates.map((state) => (
          <Switch.Root
            checked={checked}
            data-visual-state={
              state.name === "default" || state.name === "disabled" ? undefined : state.name
            }
            disabled={state.name === "disabled"}
            key={`default-${checked}-${state.name}`}
            style={{ left: state.x, position: "absolute", top: row === 0 ? 24 : 80 }}
          >
            <Switch.Thumb />
            Switch label
          </Switch.Root>
        )),
      )}
      {compactStates.map((item, index) => {
        const state = figmaSwitchStates[index % figmaSwitchStates.length]!;
        return (
          <Switch.Root
            aria-label={`Compact ${item.checked ? "on" : "off"} ${state.name}`}
            checked={item.checked}
            data-visual-state={
              state.name === "default" || state.name === "disabled" ? undefined : state.name
            }
            disabled={state.name === "disabled"}
            key={`compact-${item.checked}-${state.name}`}
            size="compact"
            style={{ left: item.x, position: "absolute", top: 136 }}
          >
            <Switch.Thumb />
          </Switch.Root>
        );
      })}
    </div>,
  );

  await document.fonts.load('400 13px "Inter"', "Switch label");
  await expect.poll(() => document.fonts.check('400 13px "Inter"')).toBe(true);

  const board = screen.getByTestId("switch-figma-state-board");
  const roots = board.element().querySelectorAll<HTMLElement>('[data-slot="switch"]');
  const tracks = board.element().querySelectorAll<HTMLElement>('[data-slot="switch-track"]');
  const thumbs = board.element().querySelectorAll<HTMLElement>('[data-slot="switch-thumb"]');
  expect(roots).toHaveLength(20);
  expect(roots[0]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 32, width: 119 });
  expect(tracks[0]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 20, width: 30 });
  expect(thumbs[0]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 14, width: 14 });
  expect(roots[10]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 26, width: 34 });
  expect(tracks[10]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 14, width: 22 });
  expect(thumbs[10]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 10, width: 10 });
  expect(getComputedStyle(roots[0]!).fontFamily).toContain("Inter");
  expect(getComputedStyle(roots[0]!).fontSize).toBe("13px");
  await expect.poll(() => getComputedStyle(tracks[0]!).backgroundColor).toBe("rgb(112, 113, 114)");
  await expect.poll(() => getComputedStyle(tracks[1]!).backgroundColor).toBe("rgb(134, 135, 137)");
  await expect.poll(() => getComputedStyle(tracks[5]!).backgroundColor).toBe("rgb(94, 106, 210)");
  await expect.poll(() => getComputedStyle(tracks[6]!).backgroundColor).toBe("rgb(105, 117, 226)");
  await expect.poll(() => getComputedStyle(tracks[10]!).backgroundColor).toBe("rgb(212, 212, 212)");
  await expect.poll(() => getComputedStyle(thumbs[1]!).width).toBe("16px");
  await expect.poll(() => getComputedStyle(thumbs[11]!).width).toBe("12px");
  expect(getComputedStyle(roots[4]!).opacity).toBe("0.5");

  const pressedLayer = roots[2]?.querySelector<HTMLElement>('[data-slot="switch-pressed-layer"]');
  const focusLayer = roots[3]?.querySelector<HTMLElement>('[data-slot="switch-focus-layer"]');
  expect(getComputedStyle(pressedLayer!).backgroundColor).toBe("rgba(0, 0, 0, 0.08)");
  expect(pressedLayer?.getBoundingClientRect().toJSON()).toMatchObject({ height: 20, width: 30 });
  expect(getComputedStyle(focusLayer!).borderColor).toBe("rgb(94, 106, 210)");
  expect(focusLayer?.getBoundingClientRect().toJSON()).toMatchObject({ height: 26, width: 36 });

  await expect.element(board).toMatchScreenshot("switch-figma-state-board", screenshotOptions);
});

test("Switch resolves dark theme values", async () => {
  const screen = await render(
    <ThemeScope theme="dark">
      <Switch.Root defaultChecked>
        <Switch.Thumb />
        Switch label
      </Switch.Root>
    </ThemeScope>,
  );
  const root = screen.getByRole("switch", { name: "Switch label" }).element();
  const thumb = root.querySelector<HTMLElement>('[data-slot="switch-thumb"]');
  await expect.poll(() => getComputedStyle(root).color).toBe("rgb(247, 248, 248)");
  expect(getComputedStyle(thumb!).backgroundColor).toBe("rgb(255, 255, 255)");
});

for (const theme of ["light", "dark"] as const) {
  test(`Dialog canonical ${theme} state board`, async () => {
    const screen = await render(
      <ThemeScope theme={theme}>
        <Dialog.Root defaultOpen>
          <Dialog.Portal>
            <Dialog.Backdrop />
            <Dialog.Viewport>
              <Dialog.Popup data-testid="dialog-state-board">
                <Dialog.Title>Edit details</Dialog.Title>
                <Dialog.Description>Update the canonical dialog contract.</Dialog.Description>
                <TextField.Root>
                  <TextField.Label>Name</TextField.Label>
                  <TextField.Control defaultValue="Lenso UI" />
                </TextField.Root>
                <p style={{ marginBottom: 0 }}>
                  Overflow behavior remains bounded to the viewport while content scrolls inside the
                  popup.
                </p>
                <Dialog.Close />
              </Dialog.Popup>
            </Dialog.Viewport>
          </Dialog.Portal>
        </Dialog.Root>
      </ThemeScope>,
    );

    const popup = screen.getByTestId("dialog-state-board");
    await expect.element(popup).toBeVisible();
    expect(getComputedStyle(popup.element()).width).toBe("480px");
    await expect
      .poll(() => getComputedStyle(popup.element()).backgroundColor)
      .toBe(theme === "dark" ? "rgb(25, 26, 27)" : "rgb(255, 255, 255)");
    await expect
      .element(document.body)
      .toMatchScreenshot(`dialog-state-board-${theme}`, screenshotOptions);
  });
}
