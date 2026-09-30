import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "@lenso/tokens/styles.css";

import { ThemeScope, useThemePortalContainer } from "./theme-scope.js";

function PortalProbe() {
  const container = useThemePortalContainer();
  if (!container) return null;
  return createPortal(
    <div
      data-testid="floating-surface"
      style={{
        background: "var(--accent-hover)",
        position: "fixed",
        top: 32,
        left: 32,
        width: 64,
        height: 64,
        zIndex: 100,
      }}
    />,
    container,
  );
}

test("scoped portals escape clipping and keep live inherited theme variables", async () => {
  const screen = await render(
    <ThemeScope
      theme="dark"
      data-testid="scope"
      style={
        {
          "--accent": "oklch(0.7 0.15 140)",
          width: 1,
          height: 1,
          overflow: "hidden",
          transform: "translateX(12px)",
        } as CSSProperties
      }
    >
      <div data-testid="local-reference" style={{ background: "var(--accent-hover)" }} />
      <PortalProbe />
    </ThemeScope>,
  );

  const surface = screen.getByTestId("floating-surface");
  await expect.element(surface).toBeVisible();
  const reference = screen.getByTestId("local-reference").element();
  const scope = screen.getByTestId("scope").element() as HTMLElement;
  const portaled = surface.element();
  expect(scope.contains(portaled)).toBe(false);
  expect(document.elementFromPoint(40, 40)).toBe(portaled);
  const before = getComputedStyle(portaled).backgroundColor;
  expect(before).toBe(getComputedStyle(reference).backgroundColor);

  scope.style.setProperty("--accent", "oklch(0.6 0.12 30)");
  await expect
    .poll(() => getComputedStyle(portaled).backgroundColor)
    .toBe(getComputedStyle(reference).backgroundColor);
  expect(getComputedStyle(portaled).backgroundColor).not.toBe(before);

  await screen.unmount();
  expect(document.body.contains(portaled)).toBe(false);
});
