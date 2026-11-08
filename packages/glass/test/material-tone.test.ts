import { expect, test } from "bun:test";
import { materialTone } from "../src/material-tone.js";

// Published neutral-ramp samples distinguish the fitted dark transfer from a CSS contrast proxy.
test("dark materials reproduce the reference neutral ramps and interpolate control size", () => {
  const small = [32, 62, 89, 113, 134, 151, 166, 177, 185];
  const large = [32, 59, 83, 102, 117, 126, 129, 128, 121];
  for (let i = 0; i < 9; i++) {
    const rgb = [i / 8, i / 8, i / 8];
    for (const size of [0, 0.5, 1]) {
      const result = materialTone(rgb, { mode: "dark", size, clarity: 0 });
      for (const channel of result)
        expect(channel * 255).toBeCloseTo(small[i]! + (large[i]! - small[i]!) * size, 5);
    }
  }
});

test("clear material converges across appearances without a discontinuity at zero", () => {
  for (const rgb of [
    [0, 0, 0],
    [1, 1, 1],
    [0.9, 0.2, 0.4],
    [0.1, 0.6, 0.8],
  ]) {
    const light = materialTone(rgb, { mode: "light", size: 0.4, clarity: 1 });
    const dark = materialTone(rgb, { mode: "dark", size: 0.4, clarity: 1 });
    const regular = materialTone(rgb, { mode: "dark", size: 0.4, clarity: 0 });
    const near = materialTone(rgb, { mode: "dark", size: 0.4, clarity: 0.00001 });
    for (let i = 0; i < 3; i++) {
      expect(light[i]).toBeCloseTo(dark[i]!, 7);
      expect(near[i]).toBeCloseTo(regular[i]!, 4);
    }
  }
});
