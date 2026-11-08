import { expect, test } from "bun:test";
import { press } from "../../src/motion/press.js";

// The old size overrides masked pointer-specific growth; interruption also
// measured the already enlarged control, reducing the next press target.
for (const pointerType of ["mouse", "touch"]) {
  test(`press preserves its resting geometry through interruption (${pointerType})`, () => {
    const previousRaf = globalThis.requestAnimationFrame;
    const previousCancel = globalThis.cancelAnimationFrame;
    const frames = new Map<number, FrameRequestCallback>();
    let id = 0;
    let time = Number(document.timeline?.currentTime ?? performance.now());
    globalThis.requestAnimationFrame = (frame) => {
      frames.set(++id, frame);
      return id;
    };
    globalThis.cancelAnimationFrame = (key) => frames.delete(key);
    const element = document.createElement("button");
    document.body.append(element);
    const scale = () =>
      Number(element.style.getPropertyValue("--lg-press-scale").split(" ")[0] || 1);
    Object.defineProperties(element, {
      offsetWidth: { value: 60 },
      offsetHeight: { value: 60 },
    });
    element.getBoundingClientRect = () => {
      const width = 60 * scale();
      return new DOMRect(30 - width / 2, 30 - width / 2, width, width);
    };
    const advance = (count: number) => {
      for (let i = 0; i < count; i++) {
        time += 1000 / 60;
        const pending = [...frames.values()];
        frames.clear();
        pending.forEach((frame) => frame(time));
      }
    };
    const event = (type: string) =>
      new PointerEvent(type, {
        pointerId: 1,
        pointerType,
        isPrimary: true,
        button: 0,
        buttons: type === "pointerup" ? 0 : 1,
        clientX: 30,
        clientY: 30,
      });
    const stop = press(element);
    try {
      element.dispatchEvent(event("pointerdown"));
      advance(60);
      const expected = pointerType === "mouse" ? 66 : 76;
      expect(60 * scale()).toBeCloseTo(expected, 2);
      window.dispatchEvent(event("pointerup"));
      advance(2);
      element.dispatchEvent(event("pointerdown"));
      advance(60);
      expect(60 * scale()).toBeCloseTo(expected, 2);
      window.dispatchEvent(event("pointercancel"));
      advance(180);
      expect(scale()).toBe(1);
      expect(element.hasAttribute("data-lenso-pressed")).toBe(false);
      expect(frames.size).toBe(0);
    } finally {
      stop();
      element.remove();
      globalThis.requestAnimationFrame = previousRaf;
      globalThis.cancelAnimationFrame = previousCancel;
    }
  });
}

// Instantaneously applying a bigger scale is still motion. A live preference
// change must cancel deformation while retaining native pressed feedback.
test("reduced motion keeps held controls stationary and resets an active gesture", () => {
  const original = globalThis.matchMedia;
  const media = new EventTarget() as MediaQueryList;
  let reduced = false;
  Object.defineProperty(media, "matches", { get: () => reduced });
  globalThis.matchMedia = () => media;
  const element = document.createElement("button");
  document.body.append(element);
  element.getBoundingClientRect = () => new DOMRect(0, 0, 60, 60);
  const stop = press(element);
  const down = () =>
    element.dispatchEvent(
      new PointerEvent("pointerdown", {
        pointerId: 1,
        pointerType: "touch",
        isPrimary: true,
        button: 0,
        clientX: 30,
        clientY: 30,
      }),
    );
  try {
    down();
    reduced = true;
    media.dispatchEvent(new Event("change"));
    expect(element.style.getPropertyValue("--lg-press-scale")).toBe("1 1");
    expect(element.style.getPropertyValue("--lg-press-translate")).toBe("0px 0px");
    expect(element.hasAttribute("data-lenso-pressed")).toBe(true);
    window.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 1 }));
    down();
    expect(element.style.getPropertyValue("--lg-press-scale")).toBe("1 1");
  } finally {
    stop();
    element.remove();
    globalThis.matchMedia = original;
  }
});
