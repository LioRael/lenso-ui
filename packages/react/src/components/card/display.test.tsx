import { afterEach, expect, test } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { createRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { Card } from "./card.js";
import { Surface } from "../surface/surface.js";
import { Alert } from "../alert/alert.js";
import { Badge } from "../badge/badge.js";
import { Chip } from "../chip/chip.js";
import { EmptyState } from "../empty-state/empty-state.js";
import { Skeleton } from "../skeleton/skeleton.js";
import { Spinner } from "../spinner/spinner.js";
import { Avatar } from "../avatar/avatar.js";
import { AvatarGroup } from "../avatar-group/avatar-group.js";
import { Meter } from "../meter/meter.js";
import { ProgressBar } from "../progress-bar/progress-bar.js";
import { ProgressCircle } from "../progress-circle/progress-circle.js";
import { Separator } from "../separator/separator.js";
import { ScrollShadow } from "../scroll-shadow/scroll-shadow.js";
import { Kbd } from "../kbd/kbd.js";
import { Typography } from "../typography/typography.js";
import { Header } from "../header/header.js";

afterEach(cleanup);

const compositionStyles = stylex.create({
  height: (height: number) => ({ height }),
});

// Geometry coverage did not exercise native state callbacks, undefined styles or composed refs.
test("progress native state callbacks retain dynamic xstyle and composed refs", async () => {
  const rootRef = createRef<HTMLDivElement>();
  const fillRef = createRef<HTMLDivElement>();
  const example = (value: number) => (
    <ProgressBar
      ref={rootRef}
      value={value}
      aria-label="Composed progress"
      data-slot={undefined}
      render={<div data-testid="composed-progress" />}
      xstyle={compositionStyles.height(73)}
      style={(state) => (state.status === "complete" ? undefined : { opacity: 0.5 })}
    >
      <ProgressBar.Track>
        <ProgressBar.Fill
          ref={fillRef}
          data-slot="custom-fill"
          render={(props, state) => (
            <div {...props} data-testid="composed-fill" data-native-status={state.status} />
          )}
          style={(state) => (state.status === "complete" ? { opacity: 1 } : undefined)}
        />
      </ProgressBar.Track>
    </ProgressBar>
  );
  const view = await render(example(25));
  expect(rootRef.current).toBe(view.getByTestId("composed-progress").element());
  expect(fillRef.current).toBe(view.getByTestId("composed-fill").element());
  await expect
    .element(view.getByTestId("composed-progress"))
    .toHaveAttribute("data-slot", "progress-bar");
  await expect
    .element(view.getByTestId("composed-fill"))
    .toHaveAttribute("data-slot", "custom-fill");
  expect(getComputedStyle(rootRef.current!).height).toBe("73px");
  expect(getComputedStyle(rootRef.current!).opacity).toBe("0.5");
  await view.rerender(example(100));
  await expect
    .element(view.getByTestId("composed-fill"))
    .toHaveAttribute("data-native-status", "complete");
  expect(getComputedStyle(rootRef.current!).height).toBe("73px");
  expect(getComputedStyle(rootRef.current!).opacity).toBe("1");
  expect(getComputedStyle(fillRef.current!).opacity).toBe("1");
});

// The display fixtures only rendered default semantic tags, not public render composition.
test("typography render composition forwards its ref, styles and semantic attributes", async () => {
  const ref = createRef<HTMLParagraphElement>();
  const view = await render(
    <Typography
      ref={ref}
      type="body"
      data-slot="custom-text"
      render={<p data-testid="composed-text" />}
      xstyle={compositionStyles.height(47)}
      style={{ opacity: 0.7 }}
    >
      Composed text
    </Typography>,
  );
  const element = view.getByTestId("composed-text");
  expect(ref.current).toBe(element.element());
  await expect.element(element).toHaveAttribute("data-slot", "custom-text");
  await expect.element(element).toHaveAttribute("data-type", "body");
  expect(getComputedStyle(element.element()).height).toBe("47px");
  expect(getComputedStyle(element.element()).opacity).toBe("0.7");
});

test("source surface color, radius and elevation resolve in independent light and dark scopes", async () => {
  const view = await render(
    <div>
      {(["light", "dark"] as const).map((theme) => (
        <div className={theme} key={theme}>
          <div
            data-testid={`reference-${theme}`}
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "min(32px, var(--radius-3xl))",
              boxShadow: "var(--surface-shadow)",
            }}
          />
          <Card data-testid={`card-${theme}`}>
            <Card.Header>
              <Card.Title>Storage</Card.Title>
              <Card.Description>Space used</Card.Description>
            </Card.Header>
            <Card.Content>
              <Surface>
                <Typography.Heading level={2}>Usage</Typography.Heading>
                <Chip>Local</Chip>
                <Alert status="success">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Saved</Alert.Title>
                    <Alert.Description>Changes are stored.</Alert.Description>
                  </Alert.Content>
                </Alert>
                <Kbd>
                  <Kbd.Abbr keyValue="command" />
                  <Kbd.Content>K</Kbd.Content>
                </Kbd>
                <EmptyState>No files</EmptyState>
                <Header>Recent files</Header>
                <Separator />
              </Surface>
            </Card.Content>
            <Card.Footer>Available</Card.Footer>
          </Card>
        </div>
      ))}
    </div>,
  );
  for (const theme of ["light", "dark"]) {
    const card = getComputedStyle(view.getByTestId(`card-${theme}`).element());
    const reference = getComputedStyle(view.getByTestId(`reference-${theme}`).element());
    await expect.poll(() => card.backgroundColor).toBe(reference.backgroundColor);
    await expect.poll(() => card.borderRadius).toBe(reference.borderRadius);
    await expect.poll(() => card.boxShadow).toBe(reference.boxShadow);
    expect(card.boxShadow).not.toBe("none");
  }
  expect(getComputedStyle(view.getByTestId("card-light").element()).backgroundColor).not.toBe(
    getComputedStyle(view.getByTestId("card-dark").element()).backgroundColor,
  );
});

test("badge can extend outside its anchor without being clipped by a card", async () => {
  const view = await render(
    <Card style={{ width: 120 }}>
      <Badge.Anchor data-testid="anchor" style={{ width: 40, height: 40 }}>
        <Avatar>
          <Avatar.Fallback>A</Avatar.Fallback>
        </Avatar>
        <Badge data-testid="badge">
          <Badge.Label>4</Badge.Label>
        </Badge>
      </Badge.Anchor>
    </Card>,
  );
  const anchor = view.getByTestId("anchor").element().getBoundingClientRect();
  const badge = view.getByTestId("badge").element().getBoundingClientRect();
  expect(badge.right).toBeGreaterThan(anchor.right);
  expect(badge.top).toBeLessThan(anchor.top);
  const target = document.elementFromPoint(badge.right - 2, badge.top + badge.height / 2);
  expect(view.getByTestId("badge").element().contains(target)).toBe(true);
});

test("failed avatar image exposes fallback and group truncation retains the overflow count", async () => {
  const view = await render(
    <AvatarGroup max={1} size="sm" overlap="ring">
      <Avatar>
        <Avatar.Image src="data:image/png;base64,broken" alt="Ada" />
        <Avatar.Fallback>Ada initials</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>Grace initials</Avatar.Fallback>
      </Avatar>
    </AvatarGroup>,
  );
  await expect.element(view.getByText("Ada initials")).toBeVisible();
  await expect.element(view.getByText("+1")).toBeVisible();
  await expect.element(view.getByText("Grace initials")).not.toBeInTheDocument();
  expect(view.getByText("Ada initials").element().getBoundingClientRect().width).toBe(32);
});

test("meter and progress retain accessible names and normalized nonzero-minimum fill geometry", async () => {
  const view = await render(
    <div style={{ width: 240 }}>
      <Meter min={20} max={60} value={30}>
        <Meter.Label>Storage</Meter.Label>
        <Meter.Output />
        <Meter.Track data-testid="meter-track">
          <Meter.Fill data-testid="meter-fill" />
        </Meter.Track>
      </Meter>
      <ProgressBar min={20} max={60} value={30}>
        <ProgressBar.Label>Upload</ProgressBar.Label>
        <ProgressBar.Output />
        <ProgressBar.Track data-testid="progress-track">
          <ProgressBar.Fill data-testid="progress-fill" />
        </ProgressBar.Track>
      </ProgressBar>
      <ProgressCircle min={20} max={60} value={30} aria-label="Sync">
        <ProgressCircle.Track>
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle data-testid="circle-fill" />
        </ProgressCircle.Track>
      </ProgressCircle>
    </div>,
  );
  await expect
    .element(view.getByRole("meter", { name: "Storage" }))
    .toHaveAttribute("aria-valuenow", "30");
  await expect
    .element(view.getByRole("progressbar", { name: "Upload" }))
    .toHaveAttribute("aria-valuemin", "20");
  await expect
    .element(view.getByRole("progressbar", { name: "Sync" }))
    .toHaveAttribute("aria-valuenow", "30");
  for (const prefix of ["meter", "progress"]) {
    await expect
      .poll(
        () =>
          view.getByTestId(`${prefix}-fill`).element().getBoundingClientRect().width /
          view.getByTestId(`${prefix}-track`).element().getBoundingClientRect().width,
      )
      .toBeCloseTo(0.25);
  }
  expect(
    Number(view.getByTestId("circle-fill").element().getAttribute("stroke-dashoffset")),
  ).toBeCloseTo(2 * Math.PI * 16 * 0.75);
});

test("indeterminate progress does not announce a value and motion follows the real browser preference", async () => {
  const view = await render(
    <div style={{ width: 240 }}>
      <Spinner />
      <ProgressBar value={null} aria-label="Upload">
        <ProgressBar.Track>
          <ProgressBar.Fill data-testid="fill" />
        </ProgressBar.Track>
      </ProgressBar>
      <ProgressCircle value={null} aria-label="Sync">
        <ProgressCircle.Track data-testid="circle">
          <ProgressCircle.TrackCircle />
          <ProgressCircle.FillCircle />
        </ProgressCircle.Track>
      </ProgressCircle>
      <Skeleton data-testid="skeleton" style={{ width: 80, height: 20 }} />
    </div>,
  );
  await expect.element(view.getByRole("status", { name: "Loading" })).toBeVisible();
  await expect
    .element(view.getByRole("progressbar", { name: "Upload" }))
    .not.toHaveAttribute("aria-valuenow");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  for (const element of [
    view.getByRole("status").element(),
    view.getByTestId("fill").element(),
    view.getByTestId("circle").element(),
  ]) {
    expect(getComputedStyle(element).animationName === "none").toBe(reduced);
  }
  expect(
    getComputedStyle(view.getByTestId("skeleton").element(), "::after").animationName === "none",
  ).toBe(reduced);
});

test("scroll edges update after scrolling and content growth without viewport resizing", async () => {
  const view = await render(
    <ScrollShadow data-testid="scroll" style={{ height: 80, width: 160 }}>
      <div data-testid="content" style={{ height: 200 }}>
        Scrollable content
      </div>
    </ScrollShadow>,
  );
  const scroller = view.getByTestId("scroll").element() as HTMLDivElement;
  await expect.element(view.getByTestId("scroll")).toHaveAttribute("data-bottom-scroll", "true");
  scroller.scrollTop = 60;
  await expect
    .element(view.getByTestId("scroll"))
    .toHaveAttribute("data-top-bottom-scroll", "true");
  scroller.scrollTop = scroller.scrollHeight;
  await expect.element(view.getByTestId("scroll")).toHaveAttribute("data-top-scroll", "true");
  view.getByTestId("content").element().setAttribute("style", "height: 40px");
  await expect
    .poll(() => getComputedStyle(scroller).getPropertyValue("--scroll-shadow-before"))
    .toBe("0px");
  await expect
    .poll(() => getComputedStyle(scroller).getPropertyValue("--scroll-shadow-after"))
    .toBe("0px");
  view.getByTestId("content").element().setAttribute("style", "height: 300px");
  await expect.element(view.getByTestId("scroll")).toHaveAttribute("data-bottom-scroll", "true");
});

test("horizontal RTL uses logical edge detection and reverses the physical fade", async () => {
  const view = await render(
    <ScrollShadow
      data-testid="scroll"
      dir="rtl"
      orientation="horizontal"
      hideScrollBar
      size={64}
      style={{ width: 100 }}
    >
      <div style={{ width: 300 }}>Overflow</div>
    </ScrollShadow>,
  );
  const scroller = view.getByTestId("scroll").element() as HTMLDivElement;
  await expect.element(view.getByTestId("scroll")).toHaveAttribute("data-right-scroll", "true");
  expect(getComputedStyle(scroller).maskImage).toContain("270deg");
  scroller.scrollLeft = -100;
  await expect
    .element(view.getByTestId("scroll"))
    .toHaveAttribute("data-left-right-scroll", "true");
  scroller.scrollLeft = -300;
  await expect.element(view.getByTestId("scroll")).toHaveAttribute("data-left-scroll", "true");
});
