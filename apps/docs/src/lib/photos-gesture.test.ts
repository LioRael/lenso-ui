import { expect, test } from "bun:test";
import {
  draggedPhoto,
  photoReleaseVelocity,
  photoReturnFrames,
  restingPhoto,
  shouldDismissPhoto,
} from "./photos-gesture";

test("a short slow pull returns, while distance and a short downward flick can dismiss", () => {
  expect(shouldDismissPhoto(70, 0.1, 844)).toBe(false);
  expect(shouldDismissPhoto(190, 0, 844)).toBe(true);
  expect(shouldDismissPhoto(45, 0.9, 844)).toBe(true);
  expect(shouldDismissPhoto(10, 2, 844)).toBe(false);
  expect(shouldDismissPhoto(190, -0.8, 844)).toBe(false);
});

test("release velocity follows recent direction and expires after holding still", () => {
  const samples = [
    { x: 0, y: 0, time: 0 },
    { x: 0, y: 180, time: 200 },
    { x: 4, y: 145, time: 250 },
  ];
  expect(photoReleaseVelocity(samples, 260).y).toBeCloseTo(-0.7);
  expect(photoReleaseVelocity(samples, 350)).toEqual({ x: 0, y: 0 });
  const reversed = [
    { x: 0, y: 0, time: 0 },
    { x: 0, y: 200, time: 20 },
    { x: 0, y: 170, time: 40 },
  ];
  expect(photoReleaseVelocity(reversed, 40).y).toBeCloseTo(-1.5);
  expect(shouldDismissPhoto(170, photoReleaseVelocity(reversed, 40).y, 844)).toBe(false);
});

test("dragging preserves a re-grabbed pose and resists upward travel", () => {
  const base = { x: 20, y: 60, scale: 0.9, background: 0.8, controls: 0.6 };
  expect(draggedPhoto(base, 0, 0, 844, false)).toEqual(base);
  const down = draggedPhoto(restingPhoto, 30, 180, 844, false);
  expect(down.x).toBe(30);
  expect(down.y).toBe(180);
  expect(down.scale).toBeLessThan(1);
  expect(down.background).toBeLessThan(1);
  expect(draggedPhoto(restingPhoto, 0, -100, 844, false).y).toBeCloseTo(-22);
  expect(draggedPhoto(restingPhoto, 0, 180, 844, true).scale).toBe(1);
});

test("the return spring begins at the released pose, carries velocity, and restores the image and background", () => {
  const pose = draggedPhoto(restingPhoto, 20, 70, 844, false);
  const frames = photoReturnFrames(pose, { x: 0.2, y: 0.5 });
  expect(frames[0]).toEqual(pose);
  expect(frames[1]!.y).toBeGreaterThan(pose.y);
  expect(frames.at(-1)).toEqual(restingPhoto);
  expect(photoReturnFrames(pose, { x: 0, y: -0.5 })[1]!.y).toBeLessThan(pose.y);
});
