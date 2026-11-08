import { expect, test } from "bun:test";
import { appendAppleMaterial } from "../../src/apple-material.js";

// A lifted knob must not composite an opaque neutral-gray image across its face.
// Menu panels retain their separate calibrated shadow transfer.
for (const mode of ["light", "dark"] as const) {
  for (const profile of ["toggle-knob", "slider-knob", "medium"] as const) {
    test(`${mode} ${profile} keeps shadows in its owning paint layer`, () => {
      const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
      appendAppleMaterial(
        filter,
        "SourceGraphic",
        { x: 0, y: 0, width: 80, height: 40 },
        { mode, profile },
        "shadow.png",
      );
      expect(filter.querySelector('[result="material-face"]')).not.toBeNull();
      expect(filter.querySelector('[result="material-shade"]') !== null).toBe(profile === "medium");
    });
  }
}
