import { expect, test } from "bun:test";
import { sharesFusionMaterial } from "../../src/fusion-optics.js";

// Equal refraction geometry does not imply equal tint preference. A single
// shared wash would erase one member's independently selected material.
test("fusion preserves different member preference paints", () => {
  const scope = document.createElement("div");
  const surface = document.createElement("div");
  surface.style.setProperty("--lg-material", "apple");
  const members = [0, 1].map(() => {
    const member = document.createElement("div");
    member.style.cssText = "--lg-material:apple;border-radius:30px";
    Object.defineProperties(member, { offsetWidth: { value: 60 }, offsetHeight: { value: 60 } });
    scope.append(member);
    return member;
  });
  scope.append(surface);
  document.body.append(scope);
  try {
    expect(sharesFusionMaterial(surface, members)).toBe(true);
    members[0]!.style.setProperty("--lenso-glass-preference-paint", "linear-gradient(red, red)");
    expect(sharesFusionMaterial(surface, members)).toBe(false);
    members[1]!.style.setProperty("--lenso-glass-preference-paint", "linear-gradient(red, red)");
    expect(sharesFusionMaterial(surface, members)).toBe(true);
  } finally {
    scope.remove();
  }
});
