import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../tokens/src/styles.css";
import { Button } from "./button/index.js";
import { Dialog } from "./dialog/index.js";
import { IconButton } from "./icon-button/index.js";
import { Label } from "./label/index.js";
import { TextField } from "./text-field/index.js";
import { ThemeScope } from "./theme-scope/index.js";
import { PlusIcon } from "lucide-react";

const boardStyle = {
  alignItems: "flex-start",
  display: "flex",
  gap: "24px",
  padding: "24px",
  width: "760px",
} as const;

const scopeStyle = {
  alignItems: "flex-start",
  background: "var(--color-surface-canvas)",
  color: "var(--color-content-primary)",
  display: "flex",
  flex: 1,
  flexWrap: "wrap",
  gap: "12px",
  minHeight: "120px",
  padding: "20px",
} as const;

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
      style={{ background: "#ececed", height: 442, position: "relative", width: 640 }}
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
      style={{ background: "#ececed", height: 280, position: "relative", width: 1296 }}
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
  expect(icon?.getBoundingClientRect().toJSON()).toMatchObject({ height: 14, width: 14 });
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
      style={{ background: "#ececed", height: 107, position: "relative", width: 310 }}
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
  expect(markers[0]?.getBoundingClientRect().toJSON()).toMatchObject({ height: 9, width: 9 });
  expect(getComputedStyle(markers[0]!).backgroundColor).toBe("rgb(235, 87, 87)");
  expect(getComputedStyle(markers[4]!).backgroundColor).toBe("rgb(187, 135, 252)");
  expect(getComputedStyle(markers[8]!).backgroundColor).toBe("rgb(78, 167, 252)");

  await expect.element(board).toMatchScreenshot("label-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});

test("Text Field canonical Light and Dark state board", async () => {
  const screen = await render(
    <div data-testid="text-field-state-board" style={boardStyle}>
      {(["light", "dark"] as const).map((theme) => (
        <ThemeScope key={theme} style={{ ...scopeStyle, display: "block" }} theme={theme}>
          <TextField.Root>
            <TextField.Label>Workspace name</TextField.Label>
            <TextField.Control defaultValue="Lenso" />
            <TextField.Description>Visible to teammates.</TextField.Description>
          </TextField.Root>
          <TextField.Root invalid style={{ marginTop: 16 }}>
            <TextField.Label>Identifier</TextField.Label>
            <TextField.Control defaultValue="Already used" />
            <TextField.Error match>Choose another identifier.</TextField.Error>
          </TextField.Root>
          <TextField.Root disabled style={{ marginTop: 16 }}>
            <TextField.Label>Disabled</TextField.Label>
            <TextField.Control defaultValue="Unavailable" />
          </TextField.Root>
          <TextField.Root style={{ marginTop: 16 }}>
            <TextField.Label>Read only</TextField.Label>
            <TextField.Control defaultValue="Stable value" readOnly />
          </TextField.Root>
        </ThemeScope>
      ))}
    </div>,
  );

  const scopes = screen
    .getByTestId("text-field-state-board")
    .element()
    .querySelectorAll('[data-slot="theme-scope"]');
  const darkLabel = scopes[1]?.querySelector('[data-slot="text-field-label"]');
  const darkControl = scopes[1]?.querySelector('[data-slot="text-field-control"]');
  expect(darkLabel).not.toBeNull();
  expect(darkControl).not.toBeNull();
  await expect.poll(() => getComputedStyle(darkLabel!).color).toBe("rgb(247, 248, 248)");
  await expect.poll(() => getComputedStyle(darkControl!).backgroundColor).toBe("rgb(0, 0, 0)");

  await expect
    .element(screen.getByTestId("text-field-state-board"))
    .toMatchScreenshot("text-field-state-board", screenshotOptions);
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
