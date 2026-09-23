import { themeColor } from "../shared/test-theme.js";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/ibm-plex-sans/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { StatusMarker, type StatusMarkerStatus } from "./index.js";

const statuses = ["neutral", "success", "warning", "error", "info"] as const;
const positions = [0, 32, 110, 142, 223, 255, 337, 369, 435, 467] as const;

test("Status Marker matches every Figma status and presentation", async () => {
  const screen = await render(
    <>
      <div
        data-testid="status-marker-figma-state-board"
        style={{ height: 52, position: "relative", width: 1296 }}
      >
        {statuses.flatMap((status, statusIndex) =>
          (["dot", "label"] as const).map((presentation, presentationIndex) => {
            const index = statusIndex * 2 + presentationIndex;
            return (
              <StatusMarker
                key={`${status}-${presentation}`}
                presentation={presentation}
                status={status}
                style={{ left: positions[index], position: "absolute", top: 16 }}
              />
            );
          }),
        )}
      </div>
      <ThemeScope theme="dark">
        <StatusMarker data-testid="dark-marker" presentation="label" status="success">
          Operational
        </StatusMarker>
      </ThemeScope>
    </>,
  );
  await document.fonts.load('500 11px "IBM Plex Sans"', "Warning");
  const board = screen.getByTestId("status-marker-figma-state-board");
  const markers = board.element().querySelectorAll<HTMLElement>('[data-slot="status-marker"]');
  expect(markers).toHaveLength(10);
  await expect.poll(() => getComputedStyle(markers[1]!).fontFamily).toContain("system-ui");
  expect(markers[1]!.scrollWidth).toBeLessThanOrEqual(markers[1]!.clientWidth);
  expect(markers[0]?.getBoundingClientRect().width).toBe(8);

  const expectedColors: Record<StatusMarkerStatus, string> = {
    error: themeColor("light", "color.status.errorContent"),
    info: themeColor("light", "color.status.infoContent"),
    neutral: themeColor("light", "color.content.tertiary"),
    success: themeColor("light", "color.status.successContent"),
    warning: themeColor("light", "color.status.warningContent"),
  };
  await expect
    .poll(() =>
      statuses.map((_, index) => {
        const dot = markers[index * 2]?.querySelector<HTMLElement>(
          '[data-slot="status-marker-dot"]',
        );
        return getComputedStyle(dot!).backgroundColor;
      }),
    )
    .toEqual(statuses.map((status) => expectedColors[status]));
  statuses.forEach((status, index) => {
    const dot = markers[index * 2]?.querySelector<HTMLElement>('[data-slot="status-marker-dot"]');
    expect(getComputedStyle(dot!).backgroundColor).toBe(expectedColors[status]);
    expect(getComputedStyle(markers[index * 2 + 1]!).color).toBe(
      themeColor("light", "color.content.secondary"),
    );
  });
  expect(screen.getByTestId("dark-marker").element().textContent).toContain("Operational");
  expect((await axe.run(board.element())).violations).toEqual([]);
});
