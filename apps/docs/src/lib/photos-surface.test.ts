import { expect, test } from "bun:test";
import { boundImage, imageRest, photoPageDirection, scaleAround } from "./photos-surface";

test("pinch and double tap keep the image point under the focal point", () => {
  const base = { x: 30, y: -10, scale: 2 };
  const origin = { x: 90, y: 120 };
  const destination = { x: 110, y: 100 };
  const zoomed = scaleAround(base, origin, destination, 3);
  expect((destination.x - zoomed.x) / zoomed.scale).toBe((origin.x - base.x) / base.scale);
  expect((destination.y - zoomed.y) / zoomed.scale).toBe((origin.y - base.y) / base.scale);
  expect(scaleAround(zoomed, destination, origin, 2)).toEqual(base);
});

test("panning respects the fitted photo rather than the full image element", () => {
  const geometry = { width: 390, height: 260, viewportWidth: 390, viewportHeight: 620 };
  expect(boundImage({ x: 300, y: 90, scale: 2 }, geometry)).toEqual({ x: 195, y: 0, scale: 2 });
  expect(boundImage({ x: 100, y: 100, scale: 1 }, geometry)).toEqual(imageRest);
  const elastic = boundImage({ x: 300, y: 90, scale: 2 }, geometry, true);
  expect(elastic.x).toBeGreaterThan(195);
  expect(elastic.x).toBeLessThan(300);
  expect(elastic.y).toBeCloseTo(19.8);
});

test("paging rejects jitter and an upward reversal of horizontal intent", () => {
  expect(photoPageDirection(-100, 0, 390)).toBe(1);
  expect(photoPageDirection(100, 0, 390)).toBe(-1);
  expect(photoPageDirection(-30, -0.8, 390)).toBe(1);
  expect(photoPageDirection(-10, -2, 390)).toBe(0);
  expect(photoPageDirection(-150, 0.8, 390)).toBe(0);
  expect(photoPageDirection(35, 0.1, 390)).toBe(0);
});
