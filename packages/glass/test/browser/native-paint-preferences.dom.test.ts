import { expect, test } from "bun:test";
import { paintMovingMaterialBackdrop } from "../../src/backdrop-paints.js";
import { paintMovingBackdrop } from "../../src/panel-backdrop.js";
import { observeBackdrop } from "../../src/backdrop-scheduler.js";

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
const painters = [
  ["calibrated", (lens: HTMLElement) => paintMovingMaterialBackdrop(lens)],
  ["panel", (lens: HTMLElement) => paintMovingBackdrop(lens)],
] as const;

async function fixture(run: (lens: HTMLElement) => Promise<void>) {
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  const raf = globalThis.requestAnimationFrame;
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  globalThis.requestAnimationFrame = () => 1;
  const lens = document.createElement("div");
  lens.className = "caller-material-class";
  lens.style.cssText =
    "--apple-material-profile:medium;--lg-blur:15.3px;--lenso-material-action-mode:light;--lenso-panel-paint-1:red;--lenso-panel-paint-2:green;--lenso-panel-paint-3:transparent;--lenso-panel-blend-1:normal;--lenso-panel-blend-2:normal;--lenso-panel-blend-3:normal";
  document.body.append(lens);
  try {
    await run(lens);
  } finally {
    lens.remove();
    globalThis.requestAnimationFrame = raf;
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
}

// Existing preference tests call the resting attachment wrapper. They do not
// catch moving native layers ignoring opaque, clear or tinted preferences.
for (const [name, attach] of painters) {
  test(`${name} moving paints preserve preferences and restore the default recipe`, () =>
    fixture(async (lens) => {
      const original = lens.style.cssText;
      const stop = attach(lens);
      const paints = lens.previousElementSibling!;
      const visible = () =>
        [...paints.children].filter((e) => (e as HTMLElement).style.display !== "none");
      try {
        await settle();
        expect(lens.style.cssText).toBe(original);
        expect(lens.className).toBe("caller-material-class");
        expect(lens.hasAttribute("data-lenso-glass-preferences")).toBe(false);
        lens.style.setProperty("--lenso-glass-transparency", "0");
        await settle();
        expect(visible()).toHaveLength(0);
        expect(lens.hasAttribute("data-lenso-glass-opaque")).toBe(true);
        expect(lens.style.getPropertyValue("--lenso-glass-preference-paint")).toContain("100%");
        lens.style.setProperty("--lenso-glass-transparency", ".4");
        lens.style.setProperty("--lenso-glass-tint-amount", "0");
        await settle();
        expect(lens.hasAttribute("data-lenso-glass-opaque")).toBe(false);
        expect(visible().length).toBeGreaterThan(0);
        expect(
          parseFloat(
            (visible()[0] as HTMLElement).style.backdropFilter.match(/blur\(([^)]+)/)![1]!,
          ),
        ).toBeCloseTo(1.3);
        expect(lens.style.getPropertyValue("--lg-blur")).toBe("15.3px");
        expect(lens.style.getPropertyValue("--lenso-glass-preference-paint")).toContain("60%");
        lens.style.setProperty("--lenso-glass-tint-amount", "1");
        await settle();
        expect(lens.style.getPropertyValue("--lenso-glass-preference-paint")).toContain(
          "rgb(247 247 249 / .96)",
        );
        lens.style.setProperty("--lg-blur", "20px");
        await settle();
        expect((visible()[0] as HTMLElement).style.backdropFilter).toContain("blur(20px)");
        lens.style.setProperty("--lg-blur", "15.3px");
        lens.style.setProperty("--lenso-glass-transparency", "1");
        lens.style.setProperty("--lenso-glass-tint-amount", ".5");
        await settle();
        expect(lens.hasAttribute("data-lenso-glass-preferences")).toBe(false);
        expect(lens.style.getPropertyValue("--lenso-glass-preference-paint")).toBe("");
        expect(lens.className).toBe("caller-material-class");
        expect((visible()[0] as HTMLElement).style.backdropFilter).toContain("blur(15.3px)");
      } finally {
        stop();
      }
      expect(paints.isConnected).toBe(false);
      expect(lens.hasAttribute("data-material-paints")).toBe(false);
      expect(lens.className).toBe("caller-material-class");
    }));

  // A different shared client can retire a surface after its read but before
  // the batch commits. Its queued paint must not resurrect ownership markers.
  test(`${name} discarded opaque paint cannot commit after retirement`, () =>
    fixture(async (lens) => {
      lens.style.setProperty("--lenso-glass-transparency", "0");
      const stop = attach(lens);
      const other = document.createElement("div");
      document.body.append(other);
      let resurrected = false;
      const watcher = observeBackdrop({
        element: other,
        source: other,
        layer: document.createElement("div"),
        prepare() {},
        read() {
          stop();
          return () => {
            resurrected ||=
              lens.hasAttribute("data-material-paints") ||
              lens.hasAttribute("data-lenso-glass-opaque");
          };
        },
      });
      try {
        await settle();
        expect(resurrected).toBe(false);
        expect(lens.hasAttribute("data-material-paints")).toBe(false);
        expect(lens.hasAttribute("data-lenso-glass-opaque")).toBe(false);
        expect(lens.style.getPropertyValue("--lenso-glass-preference-paint")).toBe("");
      } finally {
        watcher.stop();
        stop();
        other.remove();
      }
    }));
}

// Native top-layer ownership uses no sibling paint nodes; preference changes
// must still reach that owner and restore caller state on retirement.
test("native popup paint preserves opaque and clear preferences", () =>
  fixture(async (lens) => {
    lens.setAttribute("popover", "manual");
    lens.style.setProperty("--lenso-native-material-filter", "caller-filter", "important");
    const stop = paintMovingMaterialBackdrop(lens);
    try {
      expect(lens.style.getPropertyValue("--lenso-native-material-filter")).toContain(
        "blur(15.3px)",
      );
      lens.style.setProperty("--lenso-glass-transparency", "0");
      await settle();
      expect(lens.hasAttribute("data-lenso-glass-opaque")).toBe(true);
      expect(lens.style.getPropertyValue("--lenso-native-material-filter")).toBe("none");
      lens.style.setProperty("--lenso-glass-transparency", ".4");
      lens.style.setProperty("--lenso-glass-tint-amount", "0");
      await settle();
      expect(lens.hasAttribute("data-lenso-glass-opaque")).toBe(false);
      expect(
        parseFloat(
          lens.style.getPropertyValue("--lenso-native-material-filter").match(/blur\(([^)]+)/)![1]!,
        ),
      ).toBeCloseTo(1.3);
      expect(lens.style.getPropertyValue("--lenso-glass-preference-paint")).toContain("60%");
    } finally {
      stop();
    }
    expect(lens.style.getPropertyValue("--lenso-native-material-filter")).toBe("caller-filter");
    expect(lens.style.getPropertyPriority("--lenso-native-material-filter")).toBe("important");
    expect(lens.className).toBe("caller-material-class");
  }));
