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

function SurfaceStateBoard({ background, testId }: { background: string; testId: string }) {
  return (
    <div
      data-testid={testId}
      style={{ background, height: 268, position: "relative", width: 1282 }}
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
  );
}

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
      <SurfaceStateBoard background="#ececed" testId="surface-figma-state-board" />
      <ThemeScope theme="dark">
        <SurfaceStateBoard background="#000000" testId="surface-dark-state-board" />
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
  const darkBoard = screen.getByTestId("surface-dark-state-board");
  const surfaces = board.element().querySelectorAll<HTMLElement>('[data-slot="surface"]');
  const darkSurfaces = darkBoard.element().querySelectorAll<HTMLElement>('[data-slot="surface"]');
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
  await expect.poll(() => getComputedStyle(surfaces[0]!).borderRadius).toBe("10px");
  await expect
    .poll(() => getComputedStyle(surfaces[1]!).boxShadow)
    .toContain("rgba(0, 0, 0, 0.086)");
  await expect.poll(() => getComputedStyle(surfaces[2]!).borderWidth).toBe("1px");
  await expect.poll(() => getComputedStyle(surfaces[2]!).borderRadius).toBe("12px");
  await expect
    .poll(() => getComputedStyle(screen.getByTestId("dark-panel").element()).backgroundColor)
    .toBe("rgb(26, 26, 27)");
  expect(darkSurfaces).toHaveLength(3);
  await expect.poll(() => getComputedStyle(darkSurfaces[0]!).backgroundColor).toBe("rgb(0, 0, 0)");
  await expect
    .poll(() => getComputedStyle(darkSurfaces[1]!).backgroundColor)
    .toBe("rgb(26, 26, 27)");
  await expect
    .poll(() => getComputedStyle(darkSurfaces[1]!).boxShadow)
    .toContain("rgba(255, 255, 255, 0.082)");
  await expect
    .poll(() => getComputedStyle(darkSurfaces[1]!).boxShadow)
    .toContain("rgba(0, 0, 0, 0.3)");
  await expect
    .poll(() => getComputedStyle(darkSurfaces[2]!).backgroundColor)
    .toBe("rgb(40, 41, 43)");
  await expect
    .poll(() => getComputedStyle(darkSurfaces[2]!).boxShadow)
    .toContain("rgba(0, 0, 0, 0.125)");
  expect(screen.getByTestId("custom-surface").element().tagName).toBe("SECTION");
  expect((await axe.run(board.element())).violations).toEqual([]);
});
