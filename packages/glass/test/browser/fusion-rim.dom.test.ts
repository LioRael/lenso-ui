import { expect, test } from "bun:test";
import { paintFusionContour } from "../../src/fusion-contour.js";
import { fusionGeometry } from "../../src/fusion-geometry.js";
import { foregroundRimPixels } from "../../src/foreground-rim.js";
import type { Shape } from "../../src/refraction.js";

// Sampling the standalone helper alone cannot catch a shared contour replacing
// its fitted material with a flat stroke, or scanning a full group on every update.
test("light fusion paints the standalone rim at its offset without resampling a capsule", () => {
  const shape: Shape = {
    bezel: undefined,
    thickness: undefined,
    level: 1,
    zoom: 1,
    saturation: 1,
    dispersion: 0,
    faceSaturation: 1,
    lightIntensity: 0.25,
    lightAngle: 0,
    bevel: undefined,
    splay: undefined,
    appleMode: "light",
    materialTint: undefined,
    sourceBlur: 15.3,
    materialProfile: "small",
    materialSurface: "group",
  };
  const rectangle = { x: 20, y: 8, width: 220, height: 34, radius: 17 };
  const sample = fusionGeometry([rectangle], 0);
  const canvas = document.createElement("canvas");
  let painted: ImageData | undefined;
  let position: number[] = [];
  canvas.getContext = (() => ({
    setTransform() {},
    clearRect() {},
    putImageData(image: ImageData, x: number, y: number) {
      painted = image;
      position = [x, y];
    },
  })) as unknown as typeof canvas.getContext;
  const geometry = Object.assign(() => {
    throw new Error("A capsule must reuse its rim strips");
  }, sample);
  paintFusionContour(canvas, 280, 60, "", geometry, shape);
  const expected = foregroundRimPixels(rectangle.width, rectangle.height, rectangle.radius, shape);
  expect(painted?.data).toEqual(expected.data);
  expect(position).toEqual([86, 62]);
});
