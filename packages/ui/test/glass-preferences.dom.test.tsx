import { expect, test } from "bun:test";
import { watchGlassPreferences } from "../../glass/src/preferences.js";

// A changed opacity alone leaves the encoded blur stale until an unrelated resize.
test("clear preferences refit optics without resizing and restore caller blur on cleanup", async () => {
  const element = document.createElement("div");
  element.style.cssText =
    "--lg-blur:8px;--lenso-glass-tint-amount:.5;--apple-material-profile:medium";
  document.body.append(element);
  let attached = 0,
    detached = 0;
  const stop = watchGlassPreferences(element, () => {
    attached++;
    return () => {
      detached++;
    };
  });
  try {
    expect(attached).toBe(1);
    element.style.setProperty("--lenso-glass-tint-amount", "0");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(parseFloat(element.style.getPropertyValue("--lg-blur"))).toBeCloseTo(1.3, 5);
    expect(element.style.getPropertyValue("--lenso-glass-face-opacity")).toBe("1");
    expect(attached).toBe(2);
    expect(detached).toBe(1);
    element.style.setProperty("--lenso-glass-tint-amount", ".5");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(element.style.getPropertyValue("--lg-blur")).toBe("8px");
    expect(attached).toBe(3);
    element.style.setProperty("--lg-blur", "12px");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(element.style.getPropertyValue("--lg-blur")).toBe("12px");
  } finally {
    stop();
    element.remove();
  }
  expect(element.style.getPropertyValue("--lg-blur")).toBe("12px");
  expect(detached).toBe(attached);
});
