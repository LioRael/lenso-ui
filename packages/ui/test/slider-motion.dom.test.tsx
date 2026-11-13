import { afterEach, expect, test } from "bun:test";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Slider } from "../src/components/slider/index.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
let root: Root | undefined;
const originalMedia = globalThis.matchMedia;
afterEach(async () => {
  if (root) await act(() => root!.unmount());
  root = undefined;
  globalThis.matchMedia = originalMedia;
  document.body.replaceChildren();
});
function pointer(element: EventTarget, type: string) {
  element.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: type === "pointerdown" ? 1 : 0,
      clientX: 40,
      clientY: 25,
    }),
  );
}
async function mount(readOnly = false) {
  globalThis.matchMedia = (query) => {
    return query === "(prefers-reduced-motion: reduce)"
      ? (Object.defineProperty(new EventTarget(), "matches", { value: true }) as MediaQueryList)
      : originalMedia(query);
  };
  const host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  await act(async () =>
    root!.render(
      <Slider defaultValue={[20, 80]} readOnly={readOnly}>
        <Slider.Control>
          <Slider.Track>
            <Slider.Fill />
            <Slider.Thumb index={0} aria-label="Start" />
            <Slider.Thumb index={1} aria-label="End" />
          </Slider.Track>
        </Slider.Control>
      </Slider>,
    ),
  );
  await act(async () => {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  for (const element of host.querySelectorAll<HTMLElement>(
    "[data-lenso-slot='slider-control'], [data-lenso-slot='slider-track']",
  ))
    element.getBoundingClientRect = () => new DOMRect(0, 0, 200, 50);
  return [...host.querySelectorAll<HTMLElement>("[data-lenso-slot='slider-thumb']")];
}

test("only the SDK's dragged thumb lifts, then restores its face on release", async () => {
  const [start, end] = await mount();
  await act(async () => {
    pointer(start!, "pointerdown");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  expect(start!.hasAttribute("data-dragging")).toBe(true);
  expect(Number(start!.style.getPropertyValue("--lg-slider-face"))).toBeCloseTo(0.09);
  expect(end!.style.getPropertyValue("--lg-slider-face")).toBe("1");
  await act(async () => {
    pointer(start!, "pointerup");
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  expect(start!.hasAttribute("data-dragging")).toBe(false);
  expect(start!.style.getPropertyValue("--lg-slider-face")).toBe("1");
});

test("readonly thumbs stay at rest and range keys switch focus presentation to keyboard", async () => {
  const [start] = await mount(true);
  await act(() => pointer(start!, "pointerdown"));
  expect(start!.hasAttribute("data-dragging")).toBe(false);
  expect(start!.style.getPropertyValue("--lg-slider-face")).toBe("1");
  expect(document.documentElement.getAttribute("data-lenso-focus-method")).toBe("pointer");
  await act(() =>
    start!.querySelector("input")!.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  expect(document.documentElement.getAttribute("data-lenso-focus-method")).toBe("keyboard");
});
