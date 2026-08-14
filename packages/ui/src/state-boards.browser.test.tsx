import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";

import "../../tokens/src/styles.css";
import { Button } from "./button/index.js";
import { Dialog } from "./dialog/index.js";
import { TextField } from "./text-field/index.js";
import { ThemeScope } from "./theme-scope/index.js";

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
  comparatorOptions: { allowedMismatchedPixelRatio: 0.02 },
};

test("Button canonical Light and Dark state board", async () => {
  const screen = await render(
    <div data-testid="button-state-board" style={boardStyle}>
      {(["light", "dark"] as const).map((theme) => (
        <ThemeScope key={theme} style={scopeStyle} theme={theme}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button size="default" variant="ghost">
            Ghost
          </Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button loading>Loading</Button>
        </ThemeScope>
      ))}
    </div>,
  );

  await expect
    .element(screen.getByTestId("button-state-board"))
    .toMatchScreenshot("button-state-board", screenshotOptions);
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
