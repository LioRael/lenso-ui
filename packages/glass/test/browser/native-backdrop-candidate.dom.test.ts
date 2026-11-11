import { expect, test } from "bun:test";
import { watchNativeBackdropCandidate } from "../../src/native-backdrop-candidate.js";
import { copyBackdrop } from "../../src/backdrop.js";
import { registerSharedBackdrop } from "../../src/gpu-backdrop.js";
import { BackdropReads } from "../../src/backdrop-scheduler.js";

// GPU retention tests use eligible DPR/blur recipes. They cannot catch hidden
// copy creation and perpetual animation polling on the default native recipe.
test("unsupported native recipes never mount a hidden backdrop copy", () => {
  const root = document.createElement("div");
  const source = document.createElement("div");
  const lens = document.createElement("div");
  lens.style.cssText = "--lg-material:apple;--lg-blur:15.3px";
  root.append(source, lens);
  document.body.append(root);
  const stop = copyBackdrop(lens, source, false, undefined, 0, true);
  try {
    expect(root.childElementCount).toBe(2);
  } finally {
    stop();
    root.remove();
  }
});

// Moving between screens and changing recipes must re-enable acceleration;
// gating once at mount would leave formerly eligible or ineligible owners stale.
test("native copy eligibility follows density and inherited recipe changes and cleans up", async () => {
  const density = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
  Object.defineProperty(globalThis, "devicePixelRatio", { configurable: true, value: 3 });
  const root = document.createElement("div");
  const element = document.createElement("div");
  element.style.cssText = "--lg-material:apple;--lg-blur:3px";
  root.append(element);
  document.body.append(root);
  let attached = 0,
    detached = 0;
  const stop = watchNativeBackdropCandidate(element, () => {
    attached++;
    return () => detached++;
  });
  const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
  try {
    expect(attached).toBe(0);
    Object.defineProperty(globalThis, "devicePixelRatio", { configurable: true, value: 2 });
    window.dispatchEvent(new Event("resize"));
    expect(attached).toBe(1);
    root.className = "changed-theme";
    await settle();
    expect(attached).toBe(1);
    element.style.setProperty("--lg-blur", "15.3px");
    await settle();
    expect(detached).toBe(1);
    element.style.setProperty("--lg-blur", "8px");
    await settle();
    expect(attached).toBe(2);
    stop();
    expect(detached).toBe(2);
    window.dispatchEvent(new Event("resize"));
    element.style.setProperty("--lg-blur", "3px");
    await settle();
    expect(attached).toBe(2);
  } finally {
    stop();
    root.remove();
    if (density) Object.defineProperty(globalThis, "devicePixelRatio", density);
    else Reflect.deleteProperty(globalThis, "devicePixelRatio");
  }
});

// Non-native browsers need their DOM copy even when acceleration is impossible.
// Verify that backend rejection happens before source capture and geometry work.
test.each([
  [3, "3px"],
  [1, "15.3px"],
])("unsupported batch rejects before source or layout reads (DPR %s, blur %s)", (dpr, blur) => {
  const density = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
  Object.defineProperty(globalThis, "devicePixelRatio", { configurable: true, value: dpr });
  const source = document.createElement("div");
  const element = document.createElement("div");
  element.style.cssText = `--lg-material:apple;--lg-blur:${blur}`;
  const registration = registerSharedBackdrop(
    element,
    source,
    document.createElement("div"),
    document.createElement("div"),
    () => {},
  )!;
  const reads = new BackdropReads();
  reads.style = (target) => {
    if (target !== element) throw new Error("Unsupported batch captured its source");
    return getComputedStyle(element);
  };
  reads.box = () => {
    throw new Error("Unsupported batch forced geometry");
  };
  reads.size = () => {
    throw new Error("Unsupported batch forced layout");
  };
  try {
    const result = registration.read(
      { content: true, styles: true, animated: new Map() },
      reads,
      0,
    );
    expect(result.native).toBe(true);
    result.write();
  } finally {
    registration.stop();
    if (density) Object.defineProperty(globalThis, "devicePixelRatio", density);
    else Reflect.deleteProperty(globalThis, "devicePixelRatio");
  }
});
