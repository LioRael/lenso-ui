import { expect, test } from "bun:test";
import { softEdgeBands, softEdgeMask, softEdgeTintMask } from "../src/utils/materials/soft-edge.js";

test("fully covered blur bands reach the intended radius without cumulative overblur", () => {
  // Mask-only tests miss the excess blur from stacking complete target radii.
  let variance = 0;
  const targets = [0.2125, 0.425, 0.85, 1.7, 3.4, 4.2];
  for (const [index, band] of softEdgeBands.entries()) {
    variance += band.blur ** 2;
    expect(Math.sqrt(variance)).toBeCloseTo(targets[index]!, 10);
  }
});

function stops(mask: string) {
  return [...mask.matchAll(/rgb\(0 0 0 \/ ([\d.]+)\) ([\d.]+)%/g)].map((m) => ({
    alpha: Number(m[1]),
    position: Number(m[2]),
  }));
}

test("the tint clears faster through the middle without changing the blur mask curve", () => {
  // Endpoint-only coverage cannot detect accidentally reusing the slower wash.
  const tint = stops(softEdgeTintMask);
  expect(tint[0]!.alpha).toBe(1);
  expect(tint.at(-1)!.alpha).toBe(0);
  expect(tint[8]!.alpha).toBeLessThan(0.45);
  expect(stops(softEdgeMask())[8]!.alpha).toBe(0.5);
  for (let index = 1; index < tint.length; index++) {
    expect(tint[index]!.alpha).toBeLessThanOrEqual(tint[index - 1]!.alpha);
  }
});

test("soft edge reaches clear with a gentle tail instead of a visible linear cutoff", () => {
  // A linear 20% tail drops 6.25% per sample at the boundary. That edge
  // remains visible over sharp content even though its final alpha is zero.
  for (const mask of [...softEdgeBands.map((band) => band.mask), softEdgeMask()]) {
    const samples = stops(mask);
    expect(samples.length).toBeGreaterThan(8);
    expect(samples[0]!.alpha).toBe(1);
    expect(samples.at(-1)!.alpha).toBe(0);
    expect(samples.at(-2)!.alpha).toBeLessThan(0.011);
    expect(1 - samples[1]!.alpha).toBeLessThan(0.011);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]!.alpha).toBeLessThanOrEqual(samples[i - 1]!.alpha);
      expect(samples[i]!.position).toBeGreaterThan(samples[i - 1]!.position);
    }
  }
  expect(stops(softEdgeBands[0]!.mask).at(-1)!.position).toBe(100);
});

test("successive blur bands overlap through their transitions without adding filter surfaces", () => {
  expect(softEdgeBands).toHaveLength(6);
  for (let i = 1; i < softEdgeBands.length; i++) {
    const outer = stops(softEdgeBands[i - 1]!.mask);
    const inner = stops(softEdgeBands[i]!.mask);
    expect(inner.at(-1)!.position).toBeGreaterThan(outer[0]!.position);
    expect(inner[0]!.position).toBeGreaterThanOrEqual(0);
    expect(softEdgeBands[i]!.blur).toBeGreaterThan(0);
  }
});

test("the bar shoulder clears before the middle without removing the near-clear tail", () => {
  // Generic equal-width band generation would extend the shoulder into the middle.
  expect(stops(softEdgeBands.at(-1)!.mask).at(-1)!.position).toBeLessThan(50);
  expect(stops(softEdgeBands[0]!.mask).at(-1)!.position).toBe(100);
});
