import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import * as stylex from "@stylexjs/stylex";
import { scrollShadowProperties, scrollShadowStyles } from "@lenso/tokens/scroll-shadow";
import { ScrollShadow } from "./scroll-shadow.js";
import { Skeleton } from "../skeleton/skeleton.js";
import { Typography } from "../typography/typography.js";
import { ProgressCircle } from "../progress-circle/progress-circle.js";

afterEach(cleanup);

// Existing display coverage only measures observed edges and native children.
// These failures require native timeline interpolation, opaque DOM, and custom SVG radii.
test("auto masks work before measurement and continuously interpolate within the fade range", async () => {
  if (!CSS.supports("animation-timeline", "scroll(self)")) return;
  const view = await render(
    <>
      <style href="lenso-scroll-shadow-properties" precedence="lenso-components">
        {scrollShadowProperties}
      </style>
      <div
        data-testid="unmeasured"
        {...stylex.props(
          scrollShadowStyles.root,
          scrollShadowStyles.vertical,
          scrollShadowStyles.verticalMask,
          scrollShadowStyles.automatic,
          scrollShadowStyles.verticalTimeline,
        )}
        style={{ height: 80, width: 160 }}
      >
        <div style={{ height: 300 }} />
      </div>
    </>,
  );
  const element = view.getByTestId("unmeasured").element();
  await expect
    .poll(() => getComputedStyle(element).getPropertyValue("--scroll-shadow-end-fade"))
    .toBe("40px");
  expect(getComputedStyle(element).maskImage).not.toBe("none");
  element.scrollTop = 20;
  await expect
    .poll(() =>
      Number.parseFloat(getComputedStyle(element).getPropertyValue("--scroll-shadow-start-fade")),
    )
    .toBeCloseTo(20);
});

test("content shrink resets a previously filled timeline and subsequent growth restores the fade", async () => {
  const view = await render(
    <ScrollShadow data-testid="scroll" style={{ height: 80, width: 160 }}>
      <div data-testid="content" style={{ height: 300 }} />
    </ScrollShadow>,
  );
  const element = view.getByTestId("scroll").element();
  element.scrollTop = 220;
  await expect.element(view.getByTestId("scroll")).toHaveAttribute("data-top-scroll", "true");
  view.getByTestId("content").element().setAttribute("style", "height:40px");
  await expect
    .poll(() => getComputedStyle(element).getPropertyValue("--scroll-shadow-before"))
    .toBe("0px");
  await expect
    .poll(() => getComputedStyle(element).getPropertyValue("--scroll-shadow-after"))
    .toBe("0px");
  view.getByTestId("content").element().setAttribute("style", "height:400px");
  await expect.element(view.getByTestId("scroll")).toHaveAttribute("data-bottom-scroll", "true");
  await expect
    .poll(() => getComputedStyle(element).getPropertyValue("--scroll-shadow-after"))
    .toBe("40px");
});

test("an orientation change reports its new edge through the latest visibility callback", async () => {
  const first = vi.fn();
  const second = vi.fn();
  const view = await render(
    <ScrollShadow style={{ width: 80, height: 80 }} onVisibilityChange={first}>
      <div style={{ width: 200, height: 200 }} />
    </ScrollShadow>,
  );
  expect(first).toHaveBeenCalledWith("bottom");
  await view.rerender(
    <ScrollShadow
      orientation="horizontal"
      style={{ width: 80, height: 80 }}
      onVisibilityChange={second}
    >
      <div style={{ width: 200, height: 200 }} />
    </ScrollShadow>,
  );
  expect(second).toHaveBeenCalledWith("right");
  expect(first).not.toHaveBeenCalledWith("right");
});

function OpaqueProse() {
  return (
    <section>
      <h2 data-testid="opaque-heading">Heading</h2>
      <p data-testid="opaque-paragraph">Paragraph</p>
    </section>
  );
}
test("Prose styles opaque and injected semantic descendants without leaking into opted-out subtrees", async () => {
  const view = await render(
    <Typography.Prose data-slot="article">
      <OpaqueProse />
      <div dangerouslySetInnerHTML={{ __html: '<h1 data-testid="injected">Injected</h1>' }} />
      <div data-prose="off">
        <h2 data-testid="opt-out">Unstyled</h2>
      </div>
    </Typography.Prose>,
  );
  expect(getComputedStyle(view.getByTestId("opaque-heading").element()).fontSize).toBe("30px");
  expect(getComputedStyle(view.getByTestId("opaque-paragraph").element()).lineHeight).toBe("28px");
  expect(getComputedStyle(view.getByTestId("injected").element()).fontSize).toBe("36px");
  expect(getComputedStyle(view.getByTestId("opt-out").element()).fontSize).not.toBe("30px");
});

function OpaqueBones() {
  return (
    <section>
      <Skeleton data-testid="child" data-slot="placeholder" style={{ width: 80, height: 20 }} />
    </section>
  );
}
test("nested shimmer uses one parent overlay even when descendants arrive through an opaque component", async () => {
  const view = await render(
    <Skeleton data-testid="parent" style={{ width: 160, height: 80 }}>
      <OpaqueBones />
    </Skeleton>,
  );
  const parent = view.getByTestId("parent").element();
  const child = view.getByTestId("child").element();
  expect(getComputedStyle(parent, "::before").content).toBe('""');
  expect(getComputedStyle(parent, "::after").content).toBe("none");
  expect(getComputedStyle(child, "::after").content).toBe("none");
  expect(getComputedStyle(parent, "::before").animationName === "none").toBe(
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
});

test("custom progress circle radii preserve normalized arc geometry", async () => {
  const view = await render(
    <ProgressCircle aria-label="Custom progress" min={20} max={60} value={30}>
      <ProgressCircle.Track>
        <ProgressCircle.FillCircle data-testid="fill" r={15} cx={20} cy={20} strokeWidth={6} />
      </ProgressCircle.Track>
    </ProgressCircle>,
  );
  const fill = view.getByTestId("fill").element();
  expect(Number(fill.getAttribute("stroke-dasharray"))).toBeCloseTo(2 * Math.PI * 15);
  expect(Number(fill.getAttribute("stroke-dashoffset"))).toBeCloseTo(2 * Math.PI * 15 * 0.75);
  expect(fill.getAttribute("transform")).toBe("rotate(-90 20 20)");
});
