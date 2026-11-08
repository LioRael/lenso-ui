import { expect, test } from "bun:test";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { PhotosDemo } from "../src/components/photos-demo";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

test.each([390, 834])(
  "search at %ipx restores its source scroll position and trigger",
  async (width) => {
    const originalWidth = window.innerWidth;
    const viewport = (
      window as unknown as {
        happyDOM: { setWindowSize(size: { width: number }): void };
      }
    ).happyDOM;
    viewport.setWindowSize({ width });
    const host = document.createElement("div");
    document.body.append(host);
    const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
    Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
    const root = createRoot(host);
    try {
      await act(() => root.render(<PhotosDemo />));
      const main = host.querySelector("main")!;
      main.scrollTop = 240;
      const triggerSelector =
        width < 768 ? '[data-slot="tab-bar-button"]' : 'button[aria-label="Search"]';
      expect(host.querySelector("nav")?.dataset.layout).toBe(width < 768 ? "phone" : "tablet");
      await act(() => host.querySelector<HTMLButtonElement>(triggerSelector)!.click());
      const input = host.querySelector<HTMLInputElement>('input[name="photos-search"]')!;
      expect(input).not.toBeNull();
      expect(document.activeElement).toBe(input);
      expect(host.querySelector('[aria-label="Search suggestions"]')).not.toBeNull();
      expect(host.querySelector('[aria-label="Photo library"]')).toBeNull();
      await act(() =>
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
      );
      expect(host.querySelector('input[name="photos-search"]')).toBeNull();
      expect(main.scrollTop).toBe(240);
      expect(document.activeElement).toBe(host.querySelector(triggerSelector));
    } finally {
      await act(() => root.unmount());
      host.remove();
      viewport.setWindowSize({ width: originalWidth });
      if (fonts) Object.defineProperty(document, "fonts", fonts);
      else Reflect.deleteProperty(document, "fonts");
    }
  },
);
