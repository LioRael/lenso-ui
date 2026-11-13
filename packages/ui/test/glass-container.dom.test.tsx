import { afterEach, expect, test } from "bun:test";
import { act, createRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { GlassContainer } from "../src/components/glass-container/index.js";
import { ButtonGroup } from "../src/components/button-group/index.js";
import { GlassToggleButton } from "../src/components/glass-toggle-button/index.js";
import { GlassButton } from "../src/components/glass-button/index.js";
import {
  attachFusion,
  GlassFusionContext,
  type FusionGroup,
} from "../../glass/dist/react/index.js";
import { MaterialBackground } from "../src/utils/materials/render.js";
import { press } from "../../glass/dist/motion/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
if (!document.fonts) Object.defineProperty(document, "fonts", { value: new EventTarget() });
let root: Root | undefined;

test("popup material decoration stays outside the enclosing interactive fusion group", async () => {
  const group: FusionGroup = { members: new Set(), update: () => {} };
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() =>
    root!.render(
      <GlassFusionContext value={group}>
        <GlassButton>Action</GlassButton>
        <div data-case="popup">
          <MaterialBackground variant="glass-medium" />
        </div>
      </GlassFusionContext>,
    ),
  );
  expect([...group.members]).toEqual([host.querySelector("button")!]);
  expect(host.querySelector('[data-case="popup"] [data-material-lens]')).not.toBe(null);
});
const frames = new Map<number, FrameRequestCallback>();
let nextFrame = 0;
let time = 0;
const raf = globalThis.requestAnimationFrame;
const cancel = globalThis.cancelAnimationFrame;
const animations = HTMLElement.prototype.getAnimations;
const documentAnimations = document.getAnimations;

function useFrames() {
  time = performance.now();
  globalThis.requestAnimationFrame = (callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  };
  globalThis.cancelAnimationFrame = (id) => {
    frames.delete(id);
  };
  HTMLElement.prototype.getAnimations = () => [];
  document.getAnimations = () => [];
}
function advance() {
  const callbacks = [...frames.values()];
  frames.clear();
  time += 1000 / 60;
  for (const callback of callbacks) callback(time);
}
function geometry(element: HTMLElement, x: number, width: () => number, height: number) {
  Object.defineProperties(element, {
    offsetWidth: { configurable: true, get: width },
    offsetHeight: { configurable: true, value: height },
  });
  element.getBoundingClientRect = () => new DOMRect(x, 0, width(), height);
  element.style.opacity = "1";
}

afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  document.body.replaceChildren();
  frames.clear();
  globalThis.requestAnimationFrame = raf;
  globalThis.cancelAnimationFrame = cancel;
  HTMLElement.prototype.getAnimations = animations;
  document.getAnimations = documentAnimations;
});

// A rebound below the rest size can cross the fusion threshold a second time.
for (const pointerType of ["mouse", "touch"]) {
  test(`glass press grows 50px to 70px and returns without undershoot (${pointerType})`, () => {
    useFrames();
    const button = document.createElement("button");
    document.body.append(button);
    geometry(button, 0, () => 50, 50);
    const stop = press(button, undefined, "--lg-press", { grow: 20, release: [230, 31] });
    const scale = () => Number(button.style.getPropertyValue("--lg-press-scale").split(" ")[0]);
    try {
      button.dispatchEvent(
        new PointerEvent("pointerdown", {
          isPrimary: true,
          button: 0,
          pointerId: 1,
          pointerType,
          clientX: 25,
          clientY: 25,
        }),
      );
      for (let i = 0; i < 90; i++) advance();
      expect(scale() * 50).toBeCloseTo(70, 1);
      window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
      const sizes: number[] = [];
      for (let i = 0; i < 120; i++) {
        advance();
        sizes.push(scale());
      }
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(1);
      expect(scale()).toBe(1);
    } finally {
      stop();
    }
  });
}

test("fusion preserves native classes, activation and refs through proximity and React updates", async () => {
  useFrames();
  let cleanup = 0;
  const element = createRef<HTMLElement>();
  function Example() {
    const [count, setCount] = useState(0);
    return (
      <GlassContainer>
        <GlassButton
          render={<button aria-label="Add" className={`count-${count}`} />}
          onClick={() => setCount(count + 1)}
          ref={(node) => {
            element.current = node;
            return () => {
              cleanup++;
            };
          }}
        >
          Add {count}
        </GlassButton>
        <GlassButton>Neighbor</GlassButton>
      </GlassContainer>
    );
  }
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() => root!.render(<Example />));
  const button = host.querySelector("button")!;
  const originalClass = button.className;
  geometry(host.querySelector('[data-lenso-slot="glass-container"]')!, 0, () => 300, 100);
  geometry(button, 20, () => 90, 50);
  geometry(host.querySelectorAll("button")[1]!, 118, () => 90, 50);
  await act(() => advance());
  expect(element.current).toBe(button);
  expect(button.className).toBe(originalClass);
  expect(button.hasAttribute("data-lenso-glass-member")).toBe(false);
  const memberClasses = [...button.classList].filter((name) => !name.startsWith("count-"));
  await act(() => button.click());
  await Promise.resolve();
  expect(button.textContent).toBe("Add 1");
  expect(memberClasses.every((name) => button.classList.contains(name))).toBe(true);
  const surface = host.querySelector<HTMLElement>("[data-lenso-glass-fusion]")!;
  expect(surface.getAttribute("aria-hidden")).toBe("true");
  expect(surface.hidden).toBe(false);
  await act(() => root!.unmount());
  root = undefined;
  expect(cleanup).toBeGreaterThan(0);
  expect(button.hasAttribute("data-lenso-glass-member")).toBe(false);
  expect(frames.size).toBe(0);
});

test("fusion remeasures presentation bounds and cleanup hides the shared surface", () => {
  useFrames();
  const container = document.createElement("div");
  const shell = document.createElement("div");
  const member = document.createElement("button");
  const surface = document.createElement("div");
  container.append(shell, member, surface);
  document.body.append(container);
  let width = 80;
  geometry(container, 0, () => 300, 100);
  geometry(shell, 10, () => 80, 50);
  geometry(member, 98, () => width, 50);
  const originalStyle = member.style.cssText;
  const group: FusionGroup = { members: new Set([shell, member]), update: () => {} };
  const detach = attachFusion(container, surface, group, 12);
  advance();
  const initial = surface.style.maskImage;
  width = 96;
  group.update();
  advance();
  expect(surface.style.maskImage).not.toBe(initial);
  expect(member.style.cssText).toBe(originalStyle);
  expect(member.hasAttribute("data-lenso-glass-member")).toBe(false);
  expect(shell.hasAttribute("data-lenso-glass-member")).toBe(false);
  width = 0;
  group.update();
  advance();
  expect(surface.hidden).toBe(true);
  expect(shell.hasAttribute("data-lenso-glass-member")).toBe(false);
  expect(document.querySelector("[data-lenso-fusion-optics]")).toBe(null);
  detach();
  expect(surface.hidden).toBe(true);
  expect(surface.style.maskImage).toBe("");
  expect(member.hasAttribute("data-lenso-glass-member")).toBe(false);
  expect(shell.hasAttribute("data-lenso-glass-member")).toBe(false);
  expect(frames.size).toBe(0);
});

// Missing release/capture must reset motion even when no pointerup arrives.
for (const exit of ["buttons-lost", "lostpointercapture", "pointercancel"]) {
  test(`glass press returns to rest on ${exit} before mouseup`, () => {
    useFrames();
    const button = document.createElement("button");
    document.body.append(button);
    geometry(button, 0, () => 50, 50);
    const stop = press(button);
    button.dispatchEvent(
      new PointerEvent("pointerdown", {
        isPrimary: true,
        button: 0,
        buttons: 1,
        pointerId: 1,
        pointerType: "mouse",
        clientX: 25,
        clientY: 25,
      }),
    );
    for (let i = 0; i < 90; i++) advance();
    expect(button.hasAttribute("data-lenso-pressed")).toBe(true);
    const event = new PointerEvent(exit === "buttons-lost" ? "pointermove" : exit, {
      pointerId: 1,
      pointerType: "mouse",
      buttons: exit === "buttons-lost" ? 0 : 1,
      clientX: 150,
      clientY: 25,
    });
    (exit === "buttons-lost" || exit === "pointercancel" ? window : button).dispatchEvent(event);
    for (let i = 0; i < 120; i++) advance();
    expect(button.hasAttribute("data-lenso-pressed")).toBe(false);
    expect(button.style.getPropertyValue("--lg-press-scale")).toBe("1 1");
    stop();
  });
}

test("fusion canvas includes pressed overflow without resizing the container", () => {
  useFrames();
  const container = document.createElement("div");
  const a = document.createElement("button");
  const b = document.createElement("button");
  const surface = document.createElement("div");
  container.append(a, b, surface);
  document.body.append(container);
  geometry(container, 0, () => 100, 44);
  geometry(a, 0, () => 44, 44);
  geometry(b, 56, () => 44, 44);
  const group: FusionGroup = { members: new Set([a, b]), update: () => {} };
  const detach = attachFusion(container, surface, group, 12);
  advance();
  expect(surface.hidden).toBe(true);
  a.getBoundingClientRect = () => new DOMRect(-8, -8, 60, 60);
  group.update();
  advance();
  expect(surface.hidden).toBe(false);
  expect(surface.style.left).toBe("-14px");
  expect(surface.style.top).toBe("-14px");
  expect(surface.style.width).toBe("120px");
  expect(surface.style.height).toBe("72px");
  for (const layer of container.querySelectorAll<HTMLElement>(
    "[data-lenso-glass-outline], [data-lenso-glass-union-light]",
  )) {
    expect(layer.style.left).toBe("-14px");
    expect(layer.style.top).toBe("-14px");
    expect(layer.style.width).toBe("120px");
    expect(layer.style.height).toBe("72px");
  }
  const svg = decodeURIComponent(surface.style.maskImage);
  expect(svg).toContain('viewBox="0 0 120 72"');
  expect(container.getBoundingClientRect().width).toBe(100);
  expect(container.getBoundingClientRect().height).toBe(44);
  detach();
});

// Rubber-band deformation follows a held gesture beyond the original hit box.
for (const pointerType of ["mouse", "touch"])
  test(`${pointerType} press follows outside and releases on cancellation`, () => {
    useFrames();
    const button = document.createElement("button");
    document.body.append(button);
    geometry(button, 0, () => 50, 50);
    const stop = press(button);
    try {
      button.dispatchEvent(
        new PointerEvent("pointerdown", {
          isPrimary: true,
          button: 0,
          buttons: 1,
          pointerId: 2,
          pointerType,
          clientX: 25,
          clientY: 25,
        }),
      );
      button.dispatchEvent(new PointerEvent("pointerleave", { pointerId: 2, pointerType }));
      window.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 2,
          pointerType,
          buttons: 1,
          clientX: 80,
          clientY: 25,
        }),
      );
      for (let i = 0; i < 90; i++) advance();
      expect(button.hasAttribute("data-lenso-pressed")).toBe(true);
      expect(
        Number(button.style.getPropertyValue("--lg-press-scale").split(" ")[0]),
      ).toBeGreaterThan(1);
      expect(button.style.getPropertyValue("--lg-press-translate")).not.toBe("0px 0px");
      window.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 2 }));
      for (let i = 0; i < 120; i++) advance();
      expect(button.hasAttribute("data-lenso-pressed")).toBe(false);
      expect(button.style.getPropertyValue("--lg-press-scale")).toBe("1 1");
    } finally {
      stop();
    }
  });

// Testing press() directly missed the component disabling it for joined groups.
test("joined glass actions retain elastic press, light and cancellation", async () => {
  useFrames();
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(() =>
    root!.render(
      <ButtonGroup>
        <GlassButton>Action</GlassButton>
        <GlassToggleButton>Toggle</GlassToggleButton>
        <GlassButton elastic={false}>Stationary</GlassButton>
        <GlassButton disabled>Unavailable</GlassButton>
      </ButtonGroup>,
    ),
  );
  const buttons = [...host.querySelectorAll("button")];
  for (const [index, button] of buttons.entries()) {
    geometry(button, index * 50, () => 50, 50);
    button.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        isPrimary: true,
        button: 0,
        buttons: 1,
        pointerId: 7,
        pointerType: "mouse",
        clientX: index * 50 + 25,
        clientY: 25,
      }),
    );
    for (let i = 0; i < 60; i++) advance();
    expect(button.hasAttribute("data-lenso-pressed")).toBe(index < 2);
    expect(button.hasAttribute("data-lenso-light-pressed")).toBe(index < 3);
    if (index < 2)
      expect(
        Number(button.style.getPropertyValue("--lg-press-scale").split(" ")[0]),
      ).toBeGreaterThan(1);
    window.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 7 }));
    for (let i = 0; i < 120; i++) advance();
    expect(button.hasAttribute("data-lenso-pressed")).toBe(false);
    expect(button.hasAttribute("data-lenso-light-pressed")).toBe(false);
    if (index < 2) expect(button.style.getPropertyValue("--lg-press-scale")).toBe("1 1");
  }
});
