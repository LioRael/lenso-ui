import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/ibm-plex-sans/400.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ShimmerText } from "./index.js";

test("Shimmer Text keeps one readable text node and opts motion in explicitly", async () => {
  const screen = await render(
    <>
      <ShimmerText active data-testid="active-shimmer">
        Preparing response
      </ShimmerText>
      <ShimmerText data-testid="idle-shimmer">Response ready</ShimmerText>
    </>,
  );

  const active = screen.getByTestId("active-shimmer");
  expect(active.element().textContent).toBe("Preparing response");
  expect(active.element().childElementCount).toBe(0);
  expect(active.element().getAttribute("role")).toBeNull();
  expect(active.element().getAttribute("aria-live")).toBeNull();
  if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    await expect.poll(() => getComputedStyle(active.element()).animationName).not.toBe("none");
  }
  expect(getComputedStyle(screen.getByTestId("idle-shimmer").element()).animationName).toBe("none");
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});
