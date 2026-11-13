import { expect, test } from "bun:test";
import { createNativeEditorRim } from "../../src/native-editor-rim.js";
import { readLens } from "../../src/refraction.js";

// Browser interaction coverage cannot catch repeated geometry work at rest
// or a retained sibling/subscription after disposal.
test("native contour preserves editing contents and stops geometry work at rest", async () => {
  const context = HTMLCanvasElement.prototype.getContext;
  const raf = globalThis.requestAnimationFrame;
  const cancel = globalThis.cancelAnimationFrame;
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  HTMLCanvasElement.prototype.getContext = ((kind: string) =>
    kind === "2d" ? { putImageData() {} } : null) as typeof context;
  let id = 0;
  const frames = new Map<number, FrameRequestCallback>();
  globalThis.requestAnimationFrame = (callback) => {
    frames.set(++id, callback);
    return id;
  };
  globalThis.cancelAnimationFrame = (frame) => {
    frames.delete(frame);
  };
  const editor = document.createElement("textarea");
  editor.style.cssText = "--lg-material:apple;border-radius:20px";
  editor.defaultValue = "Native editor contents";
  Object.defineProperties(editor, { offsetWidth: { value: 120 }, offsetHeight: { value: 80 } });
  editor.getBoundingClientRect = () => new DOMRect(12, 30, 120, 80);
  document.body.append(editor);
  const original = editor.textContent;
  let reads = 0;
  const rim = createNativeEditorRim(editor, (style, size) => {
    reads++;
    return readLens(editor, style, size);
  });
  const output = editor.nextElementSibling!;
  try {
    for (let i = 0; i < 6; i++) {
      const pending = [...frames.values()];
      frames.clear();
      for (const frame of pending) frame(performance.now());
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    expect(output.querySelector("canvas")?.width).toBe(244);
    expect(output.getAttribute("aria-hidden")).toBe("true");
    expect(editor.querySelector("canvas")).toBeNull();
    expect(editor.textContent).toBe(original);
    expect(editor.value).toBe("Native editor contents");
    const settled = reads;
    for (let i = 0; i < 6; i++) {
      const pending = [...frames.values()];
      frames.clear();
      for (const frame of pending) frame(performance.now());
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    expect(reads).toBe(settled);
    rim.destroy();
    expect(frames.size).toBe(0);
    expect(output.isConnected).toBe(false);
    expect(editor.hasAttribute("data-material-live-rim")).toBe(false);
  } finally {
    rim.destroy();
    editor.remove();
    globalThis.requestAnimationFrame = raf;
    globalThis.cancelAnimationFrame = cancel;
    HTMLCanvasElement.prototype.getContext = context;
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});
