import type { CSSProperties } from "react";
import { StrictMode } from "react";
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
    <StrictMode>
      <ThemeScope
        theme="dark"
        dir="rtl"
        data-testid="scope"
        style={
          {
            "--accent": "oklch(0.7 0.15 140)",
            fontFamily: "monospace",
            width: 1,
            height: 1,
            overflow: "hidden",
            transform: "translateX(12px)",
          } as CSSProperties
        }
      >
        <div data-testid="local-reference" style={{ background: "var(--accent-hover)" }} />
        <PortalProbe />
      </ThemeScope>
    </StrictMode>,
  );

  const surface = screen.getByTestId("floating-surface");
  await expect.element(surface).toBeVisible();
  const reference = screen.getByTestId("local-reference").element();
  const scope = screen.getByTestId("scope").element() as HTMLElement;
  const portaled = surface.element();
  expect(scope.contains(portaled)).toBe(false);
  expect(document.elementFromPoint(40, 40)).toBe(portaled);
  expect(getComputedStyle(portaled).direction).toBe("rtl");
  expect(getComputedStyle(portaled).fontFamily).toBe("monospace");
  expect(portaled.parentElement?.getAttribute("data-theme")).toBe("dark");
  const before = getComputedStyle(portaled).backgroundColor;
  expect(before).toBe(getComputedStyle(reference).backgroundColor);

  scope.style.setProperty("--accent", "oklch(0.6 0.12 30)");
  scope.setAttribute("data-theme", "light");
  scope.dir = "ltr";
  scope.style.fontFamily = "serif";
  await expect
    .poll(() => getComputedStyle(portaled).backgroundColor)
    .toBe(getComputedStyle(reference).backgroundColor);
  expect(getComputedStyle(portaled).backgroundColor).not.toBe(before);
  await expect.poll(() => getComputedStyle(portaled).direction).toBe("ltr");
  await expect.poll(() => getComputedStyle(portaled).fontFamily).toBe("serif");
  await expect.poll(() => portaled.parentElement?.getAttribute("data-theme")).toBe("light");

  await screen.unmount();
  expect(document.body.contains(portaled)).toBe(false);
  expect(document.querySelector('[data-slot="theme-portal-host"]')).toBeNull();
});
