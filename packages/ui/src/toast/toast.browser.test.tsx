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

test("Toast matches Figma and preserves Base UI behavior", async () => {
  const screen = await render(
    <>
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
      <ThemeScope theme="dark">
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
  await expect.poll(() => getComputedStyle(defaultPreview).borderColor).toBe("rgba(0, 0, 0, 0)");
  const edgeDecoration = getComputedStyle(defaultPreview, "::before");
  expect(edgeDecoration.width).toBe("383px");
  expect(edgeDecoration.height).toBe("40px");
  expect(edgeDecoration.boxShadow).toContain("0.5px");
  await expect.poll(() => getComputedStyle(successIcon).color).toBe("rgb(0, 122, 61)");
  expect(
    Math.round(
      board.element().querySelector('[data-tone="default"]')!.getBoundingClientRect().height,
    ),
  ).toBe(41);
  await userEvent.click(screen.getByRole("button", { name: "Show toast" }));
  await expect.element(screen.getByText("Saved successfully")).toBeVisible();
  const runtimeRoot = document.querySelector('[data-slot="toast-root"]')!;
  expect(runtimeRoot.getAttribute("data-tone")).toBe("success");
  expect(getComputedStyle(runtimeRoot).backgroundColor).toBe("rgb(25, 26, 27)");
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
  await expect.element(board).toMatchScreenshot("toast-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.025 },
  });
});
