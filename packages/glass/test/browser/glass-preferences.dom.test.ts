import { expect, test } from "bun:test";
import { watchGlassPreferences } from "../../src/preferences.js";

// Opacity must not silently reset an explicitly selected clear/tinted material.
test("opacity composes with appearance while opacity-only consumers keep the regular recipe", async () => {
  const e = document.createElement("div");
  e.style.cssText = "--lg-blur:15.3px;--lenso-glass-transparency:1";
  document.body.append(e);
  let attached = 0,
    detached = 0;
  const stop = watchGlassPreferences(e, () => {
    attached++;
    return () => {
      detached++;
    };
  });
  const update = async (name: string, value: string) => {
    e.style.setProperty(name, value);
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  try {
    expect(e.style.getPropertyValue("--lenso-glass-clarity")).toBe("0");
    expect(e.style.getPropertyValue("--lg-blur")).toBe("15.3px");
    await update("--lenso-glass-transparency", ".5");
    expect(e.style.getPropertyValue("--lenso-glass-clarity")).toBe("0");
    expect(e.style.getPropertyValue("--lg-blur")).toBe("15.3px");
    expect(e.style.getPropertyValue("--lenso-glass-preference-paint")).toContain("50%");
    expect(attached).toBe(1);
    await update("--lenso-glass-transparency", "1");
    await update("--lenso-glass-tint-amount", "0");
    expect(e.style.getPropertyValue("--lenso-glass-clarity")).toBe("1");
    expect(parseFloat(e.style.getPropertyValue("--lg-blur"))).toBeCloseTo(1.3);
    await update("--lenso-glass-transparency", ".5");
    expect(e.style.getPropertyValue("--lenso-glass-clarity")).toBe("1");
    expect(e.style.getPropertyValue("--lenso-glass-preference-paint")).toContain("50%");
    await update("--lenso-glass-tint-amount", "1");
    const paint = e.style.getPropertyValue("--lenso-glass-preference-paint");
    expect(paint).toContain("50%");
    expect(paint).toContain("rgb(247 247 249 / .96)");
    await update("--lenso-glass-transparency", "0");
    expect(e.hasAttribute("data-lenso-glass-opaque")).toBe(true);
    expect(detached).toBe(attached);
  } finally {
    stop();
    e.remove();
  }
});
