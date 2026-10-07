import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { createRef, StrictMode } from "react";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Tooltip } from "./tooltip.js";
import { Popover } from "../popover/popover.js";
import { ThemeScope } from "../../utils/theme-scope.js";

afterEach(cleanup);

const sides = ["top", "bottom", "left", "right"] as const;
type Side = (typeof sides)[number];

function Fixture({
  family,
  theme = "light",
  side,
  arrow = true,
  sideOffset,
  direction = "ltr",
}: {
  family: "tooltip" | "popover";
  theme?: "light" | "dark";
  side: Side | "inline-start" | "inline-end";
  arrow?: boolean;
  sideOffset?: number | (() => number);
  direction?: "ltr" | "rtl";
}) {
  const Overlay = family === "tooltip" ? Tooltip : Popover;
  return (
    <DirectionProvider direction={direction}>
      <ThemeScope theme={theme} dir={direction}>
        <Overlay.Root defaultOpen>
          <Overlay.Trigger style={{ position: "fixed", left: 600, top: 400 }}>
            Overlay anchor
          </Overlay.Trigger>
          <Overlay.Portal>
            <Overlay.Positioner side={side} sideOffset={sideOffset}>
              <Overlay.Popup>
                {arrow && <Overlay.Arrow />}
                Overlay content
              </Overlay.Popup>
            </Overlay.Positioner>
          </Overlay.Portal>
        </Overlay.Root>
      </ThemeScope>
    </DirectionProvider>
  );
}

function gap(side: Side, popup: DOMRect, trigger: DOMRect) {
  switch (side) {
    case "top":
      return trigger.top - popup.bottom;
    case "bottom":
      return popup.top - trigger.bottom;
    case "left":
      return trigger.left - popup.right;
    case "right":
      return popup.left - trigger.right;
  }
}

function outwardTipDistance(side: Side, svg: SVGSVGElement) {
  const matrix = svg.getScreenCTM()!;
  const base = new DOMPoint(6, 0).matrixTransform(matrix);
  const tip = new DOMPoint(6, 6).matrixTransform(matrix);
  switch (side) {
    case "top":
      return tip.y - base.y;
    case "bottom":
      return base.y - tip.y;
    case "left":
      return tip.x - base.x;
    case "right":
      return base.x - tip.x;
  }
}

// Existing overlay checks proved an arrow mounted, not that its SVG joined the surface.
for (const family of ["tooltip", "popover"] as const) {
  for (const theme of ["light", "dark"] as const) {
    for (const side of sides) {
      test(`${family} ${side} ${theme}: arrow joins the popup with source typography and spacing`, async () => {
        await render(<Fixture family={family} theme={theme} side={side} />);
        await expect
          .poll(() => document.querySelector(`[data-slot="${family}-arrow"]`))
          .not.toBeNull();
        const popup = document.querySelector<HTMLElement>(`[data-slot="${family}-popup"]`)!;
        const arrow = popup.querySelector<HTMLElement>(`[data-slot="${family}-arrow"]`)!;
        const svg = arrow.querySelector("svg")!;
        const trigger = document.querySelector<HTMLElement>(`[data-slot="${family}-trigger"]`)!;
        await expect.poll(() => popup.hasAttribute("data-starting-style")).toBe(false);
        await expect.poll(() => arrow.getAttribute("data-side")).toBe(side);
        await expect
          .poll(() => {
            const box = arrow.getBoundingClientRect();
            const icon = svg.getBoundingClientRect();
            return Math.abs(box.x - icon.x) < 0.1 && Math.abs(box.y - icon.y) < 0.1;
          })
          .toBe(true);
        await expect
          .poll(() => getComputedStyle(popup).lineHeight)
          .toBe(family === "tooltip" ? "16px" : "20px");
        await expect
          .poll(() =>
            Math.abs(
              gap(side, popup.getBoundingClientRect(), trigger.getBoundingClientRect()) -
                (family === "tooltip" ? 7 : 8),
            ),
          )
          .toBeLessThanOrEqual(0.5);
        expect(svg.getBoundingClientRect().width).toBe(12);
        expect(svg.getBoundingClientRect().height).toBe(12);
        await expect.poll(() => outwardTipDistance(side, svg)).toBeCloseTo(6, 1);
        expect(gap(side, popup.getBoundingClientRect(), arrow.getBoundingClientRect())).toBeCloseTo(
          0,
          1,
        );
        expect(getComputedStyle(svg).fill).toBe(getComputedStyle(popup).backgroundColor);
        expect(getComputedStyle(svg).stroke === "none").toBe(family === "popover");
      });
    }
  }
}

for (const sideOffset of [undefined, 0, 15, () => 11]) {
  test(`tooltip without arrow preserves native offset ${String(sideOffset)}`, async () => {
    await render(<Fixture family="tooltip" side="top" arrow={false} sideOffset={sideOffset} />);
    await expect.poll(() => document.querySelector('[data-slot="tooltip-popup"]')).not.toBeNull();
    const popup = document.querySelector<HTMLElement>('[data-slot="tooltip-popup"]')!;
    const trigger = document.querySelector<HTMLElement>('[data-slot="tooltip-trigger"]')!;
    await expect
      .poll(() => gap("top", popup.getBoundingClientRect(), trigger.getBoundingClientRect()))
      .toBeCloseTo(typeof sideOffset === "function" ? sideOffset() : (sideOffset ?? 3), 1);
  });
}

for (const family of ["tooltip", "popover"] as const) {
  test(`${family} with arrow preserves explicit zero offset`, async () => {
    await render(<Fixture family={family} side="top" sideOffset={0} />);
    await expect.poll(() => document.querySelector(`[data-slot="${family}-arrow"]`)).not.toBeNull();
    const popup = document.querySelector<HTMLElement>(`[data-slot="${family}-popup"]`)!;
    const trigger = document.querySelector<HTMLElement>(`[data-slot="${family}-trigger"]`)!;
    await expect
      .poll(() => gap("top", popup.getBoundingClientRect(), trigger.getBoundingClientRect()))
      .toBeCloseTo(0, 1);
  });
}

test("tooltip updates default spacing when its arrow is conditionally mounted", async () => {
  const screen = await render(<Fixture family="tooltip" side="top" />);
  const currentGap = () =>
    gap(
      "top",
      document.querySelector('[data-slot="tooltip-popup"]')!.getBoundingClientRect(),
      document.querySelector('[data-slot="tooltip-trigger"]')!.getBoundingClientRect(),
    );
  await expect.poll(currentGap).toBeCloseTo(7, 1);
  await screen.rerender(<Fixture family="tooltip" side="top" arrow={false} />);
  await expect.poll(currentGap).toBeCloseTo(3, 1);
  await screen.rerender(<Fixture family="tooltip" side="top" />);
  await expect.poll(currentGap).toBeCloseTo(7, 1);
});

test("tooltip render-owned arrow registers under StrictMode and preserves the positioner ref", async () => {
  const ref = createRef<HTMLDivElement>();
  await render(
    <StrictMode>
      <Tooltip.Root defaultOpen>
        <Tooltip.Trigger style={{ position: "fixed", left: 600, top: 400 }}>Anchor</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner
            ref={ref}
            style={(state) => ({ opacity: state.open ? 1 : 0 })}
            render={
              <div>
                <Tooltip.Popup>
                  <Tooltip.Arrow />
                  Render-owned content
                </Tooltip.Popup>
              </div>
            }
          />
        </Tooltip.Portal>
      </Tooltip.Root>
    </StrictMode>,
  );
  await expect.poll(() => document.querySelector('[data-slot="tooltip-arrow"]')).not.toBeNull();
  await expect
    .poll(() =>
      gap(
        "top",
        document.querySelector('[data-slot="tooltip-popup"]')!.getBoundingClientRect(),
        document.querySelector('[data-slot="tooltip-trigger"]')!.getBoundingClientRect(),
      ),
    )
    .toBeCloseTo(7, 1);
  expect(ref.current).toBe(document.querySelector('[data-slot="tooltip-positioner"]'));
  expect(getComputedStyle(ref.current!).opacity).toBe("1");
});

for (const family of ["tooltip", "popover"] as const) {
  for (const direction of ["ltr", "rtl"] as const) {
    for (const side of ["inline-start", "inline-end"] as const) {
      test(`${family} ${side} ${direction}: logical arrow joins the physical popup edge`, async () => {
        await render(<Fixture family={family} side={side} direction={direction} />);
        await expect
          .poll(() => document.querySelector(`[data-slot="${family}-arrow"]`))
          .not.toBeNull();
        const popup = document.querySelector<HTMLElement>(`[data-slot="${family}-popup"]`)!;
        const arrow = popup.querySelector<HTMLElement>(`[data-slot="${family}-arrow"]`)!;
        const physicalSide = (side === "inline-start") === (direction === "ltr") ? "left" : "right";
        await expect.poll(() => arrow.getAttribute("data-side")).toBe(side);
        await expect
          .poll(() =>
            Math.abs(
              gap(physicalSide, popup.getBoundingClientRect(), arrow.getBoundingClientRect()),
            ),
          )
          .toBeLessThan(0.1);
        await expect
          .poll(() => outwardTipDistance(physicalSide, arrow.querySelector("svg")!))
          .toBeCloseTo(6, 1);
      });
    }
  }
}
