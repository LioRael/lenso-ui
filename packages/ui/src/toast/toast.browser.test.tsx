import { themeColor } from "../shared/test-theme.js";
import * as stylex from "@stylexjs/stylex";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import { XIcon } from "lucide-react";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Toast, type ToastTone } from "./index.js";
import { styles } from "./toast.stylex.js";

function PreviewToast({ tone }: { tone: ToastTone }) {
  return (
    <div {...stylex.props(styles.root)} data-tone={tone}>
      <div {...stylex.props(styles.content)}>
        <Toast.Icon tone={tone} />
        <p {...stylex.props(styles.text)}>
          <span {...stylex.props(styles.title)}>&quot;TES-11&quot;</span> copied to clipboard
        </p>
        <button aria-label="Dismiss notification" {...stylex.props(styles.close)} type="button">
          <XIcon size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function RuntimeToast() {
  const manager = Toast.useToastManager();
  return (
    <>
      <button
        onClick={() => manager.add({ description: "Saved successfully", type: "success" })}
        type="button"
      >
        Show toast
      </button>
      <Toast.Portal>
        <Toast.Viewport>
          <Toast.List />
        </Toast.Viewport>
      </Toast.Portal>
    </>
  );
}

test("Toast resolves semantic tokens and preserves Base UI behavior", async () => {
  const screen = await render(
    <>
      <ThemeScope theme="light">
        <div
          data-testid="toast-figma-state-board"
          style={{
            alignItems: "center",
            background: "#fafafa",
            display: "flex",
            gap: 24,
            height: 137,
            justifyContent: "center",
            padding: 24,
            width: 1200,
          }}
        >
          <PreviewToast tone="default" />
          <PreviewToast tone="success" />
          <PreviewToast tone="error" />
        </div>
      </ThemeScope>
      <ThemeScope theme="dark">
        <div
          data-testid="toast-figma-dark-state-board"
          style={{
            alignItems: "center",
            background: "#000000",
            display: "flex",
            gap: 24,
            height: 137,
            justifyContent: "center",
            padding: 24,
            width: 1200,
          }}
        >
          <PreviewToast tone="default" />
          <PreviewToast tone="success" />
          <PreviewToast tone="error" />
        </div>
        <Toast.Provider timeout={0}>
          <RuntimeToast />
        </Toast.Provider>
      </ThemeScope>
    </>,
  );
  await document.fonts.load('500 13px "Inter"', "copied to clipboard");
  const board = screen.getByTestId("toast-figma-state-board");
  await expect
    .poll(() => getComputedStyle(board.element().querySelector('[data-tone="default"]')!).width)
    .toBe("384px");
  const defaultPreview = board.element().querySelector<HTMLElement>('[data-tone="default"]')!;
  const successIcon = board
    .element()
    .querySelector<HTMLElement>('[data-tone="success"] [data-slot="toast-icon"]')!;
  const lightInfoIcon = board.element().querySelector<HTMLElement>('[data-tone="default"] i')!;
  const lightTitle = board.element().querySelector<HTMLElement>('[data-tone="default"] p span')!;
  const darkBoard = screen.getByTestId("toast-figma-dark-state-board");
  const darkDefaultPreview = darkBoard
    .element()
    .querySelector<HTMLElement>('[data-tone="default"]')!;
  const darkInfoIcon = darkBoard.element().querySelector<HTMLElement>('[data-tone="default"] i')!;
  const darkSuccessIcon = darkBoard
    .element()
    .querySelector<HTMLElement>('[data-tone="success"] [data-slot="toast-icon"]')!;
  const darkErrorIcon = darkBoard
    .element()
    .querySelector<HTMLElement>('[data-tone="error"] [data-slot="toast-icon"]')!;
  const lightClose = board.element().querySelector<HTMLElement>('[data-tone="default"] button')!;
  await expect.poll(() => getComputedStyle(defaultPreview).borderColor).toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(defaultPreview).backgroundColor).toBe("rgb(255, 255, 255)");
  expect(getComputedStyle(defaultPreview).borderRadius).toBe("12px");
  expect(getComputedStyle(defaultPreview).gap).toBe("8px");
  expect(defaultPreview.getBoundingClientRect().width).toBe(384);
  expect(defaultPreview.getBoundingClientRect().height).toBe(44);
  expect(getComputedStyle(lightInfoIcon).backgroundColor).toBe(
    themeColor("light", "color.content.secondary"),
  );
  expect(getComputedStyle(lightInfoIcon).color).toBe(themeColor("light", "color.content.inverse"));
  expect(lightInfoIcon.getBoundingClientRect().width).toBe(14);
  expect(lightInfoIcon.getBoundingClientRect().height).toBe(14);
  expect(getComputedStyle(lightTitle).color).toBe(themeColor("light", "color.content.primary"));
  expect(lightClose.getBoundingClientRect().width).toBe(24);
  expect(lightClose.getBoundingClientRect().height).toBe(24);
  const lightRootRect = defaultPreview.getBoundingClientRect();
  const lightCloseRect = lightClose.getBoundingClientRect();
  expect(lightCloseRect.left - lightRootRect.left).toBeCloseTo(351.5, 2);
  expect(lightCloseRect.top - lightRootRect.top).toBeCloseTo(8.5, 2);
  const edgeDecoration = getComputedStyle(defaultPreview, "::before");
  expect(edgeDecoration.backgroundColor).toBe("rgb(255, 255, 255)");
  expect(edgeDecoration.width).toBe("382px");
  expect(edgeDecoration.height).toBe("42px");
  expect(edgeDecoration.borderRadius).toBe("11.5px");

  await expect
    .poll(() => getComputedStyle(successIcon).color)
    .toBe(themeColor("light", "color.status.successContent"));
  expect(getComputedStyle(darkDefaultPreview).backgroundColor).toBe(
    themeColor("dark", "color.surface.dialog"),
  );
  expect(getComputedStyle(darkInfoIcon).backgroundColor).toBe(
    themeColor("dark", "color.content.secondary"),
  );
  expect(getComputedStyle(darkInfoIcon).color).toBe(themeColor("dark", "color.content.inverse"));
  expect(getComputedStyle(darkSuccessIcon).color).toBe(
    themeColor("dark", "color.status.successContent"),
  );
  expect(getComputedStyle(darkErrorIcon).color).toBe(
    themeColor("dark", "color.status.errorContent"),
  );
  expect(darkDefaultPreview.getBoundingClientRect().width).toBe(384);
  expect(darkDefaultPreview.getBoundingClientRect().height).toBe(44);
  const darkEdgeDecoration = getComputedStyle(darkDefaultPreview, "::before");
  expect(darkEdgeDecoration.backgroundColor).toBe(themeColor("dark", "color.surface.dialog"));
  expect(darkEdgeDecoration.borderRadius).toBe("11.5px");

  expect(
    Math.round(
      board.element().querySelector('[data-tone="default"]')!.getBoundingClientRect().height,
    ),
  ).toBe(44);
  await userEvent.click(screen.getByRole("button", { name: "Show toast" }));
  await expect.element(screen.getByText("Saved successfully")).toBeVisible();
  const runtimeRoot = document.querySelector('[data-slot="toast-root"]')!;
  expect(runtimeRoot.getAttribute("data-tone")).toBe("success");
  expect(getComputedStyle(runtimeRoot).backgroundColor).toBe(
    themeColor("dark", "color.surface.dialog"),
  );

  const runtimeClose = runtimeRoot.querySelector<HTMLButtonElement>('[data-slot="toast-close"]')!;
  const runtimeCloseIcon = runtimeClose.querySelector<HTMLElement>('[data-slot="icon"]')!;
  const runtimeRootRect = runtimeRoot.getBoundingClientRect();
  const runtimeCloseRect = runtimeClose.getBoundingClientRect();
  const runtimeCloseIconRect = runtimeCloseIcon.getBoundingClientRect();
  expect(runtimeCloseRect.left - runtimeRootRect.left).toBeCloseTo(351.5, 2);
  expect(runtimeCloseRect.top - runtimeRootRect.top).toBeCloseTo(8.5, 2);
  expect(runtimeCloseIconRect.left - runtimeRootRect.left).toBeCloseTo(355.5, 2);
  expect(runtimeCloseIconRect.top - runtimeRootRect.top).toBeCloseTo(12.5, 2);
  expect(
    (
      await axe.run(runtimeRoot, {
        rules: {
          "aria-hidden-focus": { enabled: false },
          "color-contrast": { enabled: false },
          region: { enabled: false },
        },
      })
    ).violations,
  ).toEqual([]);
  (runtimeRoot.querySelector('[data-slot="toast-close"]') as HTMLButtonElement).click();
  await expect.poll(() => document.querySelector('[data-slot="toast-root"]')).toBeNull();
});
