import { expect, test } from "bun:test";
import {
  centeredCrop,
  commitEdit,
  constrainCrop,
  hasAdjustments,
  orientedSize,
  originalAdjustments as original,
  redoEdit,
  rotateCropLeft,
  sameAdjustments,
  undoEdit,
  adjustmentFilter,
} from "../src/lib/photos-adjustments";
import { selectionRange } from "../src/lib/photos-selection";

test("drag range spans the intervening rows and retracts to the pre-gesture selection", () => {
  const ids = Array.from({ length: 12 }, (_, i) => i);
  const baseline = new Set([0, 11]);
  expect([...selectionRange(baseline, ids, 3, 11)]).toEqual([0, 11, 3, 4, 5, 6, 7, 8, 9, 10]);
  expect([...selectionRange(baseline, ids, 3, 5)]).toEqual([0, 11, 3, 4, 5]);
  expect([...baseline]).toEqual([0, 11]);
  const selected = new Set([1, 2, 3, 8]);
  expect([...selectionRange(selected, ids, 3, 1)]).toEqual([8]);
  expect([...selectionRange(selected, ids, 3, 3)]).toEqual([1, 2, 8]);
});
test("a continuous adjustment is one history entry and a new edit drops the redo branch", () => {
  const initial = { past: [], present: original, future: [] };
  const exposure = { ...original, exposure: 68 };
  const changed = commitEdit(initial, exposure);
  expect(changed.past).toHaveLength(1);
  expect(commitEdit(changed, { ...exposure })).toBe(changed);
  const undone = undoEdit(changed);
  expect(sameAdjustments(undone.present, original)).toBe(true);
  expect(redoEdit(undone).present.exposure).toBe(68);
  const branch = commitEdit(undone, { ...original, brightness: 20 });
  expect(branch.future).toHaveLength(0);
  expect(hasAdjustments(branch.present)).toBe(true);
  expect(hasAdjustments(original)).toBe(false);
});
test("rotation changes crop coordinates and aspect presets stay inside the oriented source", () => {
  const landscape = orientedSize(1200, 800, 0);
  const portrait = orientedSize(1200, 800, 270);
  expect(portrait).toEqual({ width: 800, height: 1200 });
  const landscapeSquare = centeredCrop(landscape.width, landscape.height, 1);
  expect(landscapeSquare.x).toBeCloseTo(1 / 6);
  expect(landscapeSquare.width).toBeCloseTo(2 / 3);
  expect(landscapeSquare.height).toBe(1);
  const square = centeredCrop(portrait.width, portrait.height, 1);
  expect((square.width * portrait.width) / (square.height * portrait.height)).toBeCloseTo(1);
  expect(constrainCrop({ x: -1, y: 2, width: 4, height: 0.01 })).toEqual({
    x: 0,
    y: 0.9,
    width: 1,
    height: 0.1,
  });
});
test("zero filter intensity preserves the original recipe and color edits remain independent", () => {
  expect(adjustmentFilter({ ...original, preset: "noir", intensity: 0 })).toBe(
    adjustmentFilter(original),
  );
  expect(adjustmentFilter({ ...original, preset: "vivid", intensity: 0 })).toBe(
    adjustmentFilter(original),
  );
  expect(adjustmentFilter({ ...original, warmth: 60 })).not.toBe(adjustmentFilter(original));
  expect(
    sameAdjustments(original, { ...original, crop: { ...original.crop, x: 0.1, width: 0.9 } }),
  ).toBe(false);
});

test("rotating left preserves the selected crop and four turns restore its coordinates", () => {
  const crop = { x: 0.1, y: 0.2, width: 0.6, height: 0.5 };
  const rotated = rotateCropLeft(crop);
  expect(rotated.x).toBeCloseTo(0.2);
  expect(rotated.y).toBeCloseTo(0.3);
  expect(rotated.width).toBeCloseTo(0.5);
  expect(rotated.height).toBeCloseTo(0.6);
  const restored = rotateCropLeft(rotateCropLeft(rotateCropLeft(rotated)));
  for (const axis of ["x", "y", "width", "height"] as const)
    expect(restored[axis]).toBeCloseTo(crop[axis]);
});
