import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/600.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Surface } from "./index.js";

const levels = ["embedded", "panel", "overlay"] as const;

function SurfaceContent() {
  return (
    <>
      <strong style={{ font: '600 16px "IBM Plex Sans"' }}>Panel title</strong>
      <p
        style={{
          color: "var(--color-content-secondary)",
          font: '400 13px/normal "IBM Plex Sans"',
          height: 48,
          margin: 0,
          width: 340,
        }}
      >
        Use this region for product content assembled from existing components.
      </p>
    </>
  );
}

test("Surface matches the approved Figma hierarchy and remains render-composable", async () => {
  const screen = await render(
    <>
      <div
        data-testid="surface-figma-state-board"
        style={{ background: "#ececed", height: 268, position: "relative", width: 1282 }}
      >
        {levels.map((level, index) => (
          <Surface
            key={level}
            level={level}
            style={{
              height: 220,
              left: 16 + index * 424,
              position: "absolute",
              top: 24,
              width: 400,
            }}
          >
            <SurfaceContent />
          </Surface>
        ))}
      </div>
      <ThemeScope theme="dark">
        <Surface data-testid="dark-panel" level="panel">
          Dark panel
        </Surface>
      </ThemeScope>
      <Surface
        data-testid="custom-surface"
        level="overlay"
        render={<section aria-label="Custom surface" />}
      />
    </>,
  );
  await document.fonts.load('600 16px "IBM Plex Sans"', "Panel title");
  const board = screen.getByTestId("surface-figma-state-board");
  const surfaces = board.element().querySelectorAll<HTMLElement>('[data-slot="surface"]');
  expect(surfaces).toHaveLength(3);
  await expect
    .poll(() => getComputedStyle(surfaces[0]!).backgroundColor)
    .toBe("rgb(255, 255, 255)");
  expect(Array.from(surfaces, (surface) => surface.getBoundingClientRect().width)).toEqual([
    400, 400, 400,
  ]);
  expect(Array.from(surfaces, (surface) => surface.getBoundingClientRect().height)).toEqual([
    220, 220, 220,
  ]);
  expect(getComputedStyle(surfaces[0]!).borderRadius).toBe("10px");
  expect(getComputedStyle(surfaces[1]!).boxShadow).toContain("rgba(0, 0, 0, 0.086)");
  expect(getComputedStyle(surfaces[2]!).borderWidth).toBe("1px");
  expect(getComputedStyle(surfaces[2]!).borderRadius).toBe("12px");
  expect(getComputedStyle(screen.getByTestId("dark-panel").element()).backgroundColor).toBe(
    "rgb(10, 10, 10)",
  );
  expect(screen.getByTestId("custom-surface").element().tagName).toBe("SECTION");
  expect((await axe.run(board.element())).violations).toEqual([]);
  await expect.element(board).toMatchScreenshot("surface-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.02 },
  });
});
