import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.DOCS_URL ?? "http://127.0.0.1:3000";
let reference;
for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/en/photos`, { waitUntil: "domcontentloaded" });
    const result = await page.evaluate(async () => {
      const { drawPhotoEdit, renderPhotoEdit, originalAdjustments } =
        await import("/src/lib/photos-adjustments.ts");
      const source = document.createElement("canvas");
      source.width = 80;
      source.height = 60;
      const context = source.getContext("2d");
      for (const [x, y, color] of [
        [0, 0, "rgb(160,40,20)"],
        [40, 0, "rgb(20,90,40)"],
        [0, 30, "rgb(30,50,130)"],
        [40, 30, "rgb(170,150,110)"],
      ]) {
        context.fillStyle = color;
        context.fillRect(x, y, 40, 30);
      }
      const image = new Image();
      image.src = source.toDataURL();
      await image.decode();
      const cases = [
        originalAdjustments,
        { ...originalAdjustments, exposure: 100, contrast: -50 },
        { ...originalAdjustments, saturation: -100 },
        { ...originalAdjustments, warmth: 100, tint: -100 },
        {
          ...originalAdjustments,
          rotation: 270,
          flipped: true,
          straighten: 13,
          crop: { x: 0.1, y: 0.2, width: 0.6, height: 0.5 },
        },
        ...[
          "vivid",
          "vivid-warm",
          "vivid-cool",
          "dramatic",
          "dramatic-warm",
          "dramatic-cool",
          "mono",
          "silvertone",
          "noir",
        ].map((preset, index) => ({
          ...originalAdjustments,
          preset,
          intensity: index % 2 ? 37 : 100,
          exposure: 24,
          brightness: -18,
          contrast: 31,
          saturation: 43,
          warmth: -27,
          tint: 19,
        })),
      ];
      const draw = () =>
        cases.map((value) => {
          const canvas = document.createElement("canvas");
          drawPhotoEdit(canvas, image, value);
          const data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
          // Solid interiors avoid cross-engine differences in transformed edge antialiasing.
          const pixels = [];
          for (const y of [0.25, 0.75])
            for (const x of [0.25, 0.75]) {
              const offset =
                (Math.floor(y * canvas.height) * canvas.width + Math.floor(x * canvas.width)) * 4;
              pixels.push(...data.slice(offset, offset + 4));
            }
          return { width: canvas.width, height: canvas.height, pixels };
        });
      const native = draw();
      const prototype = CanvasRenderingContext2D.prototype;
      const descriptor = Object.getOwnPropertyDescriptor(prototype, "filter");
      let fallback;
      try {
        delete prototype.filter;
        fallback = draw();
      } finally {
        if (descriptor) Object.defineProperty(prototype, "filter", descriptor);
      }
      const blob = await renderPhotoEdit(
        { src: image.src },
        {
          ...originalAdjustments,
          exposure: 100,
          rotation: 270,
          crop: { x: 0, y: 0, width: 0.5, height: 1 },
        },
      );
      const url = URL.createObjectURL(blob);
      try {
        const saved = new Image();
        saved.src = url;
        await saved.decode();
        const canvas = document.createElement("canvas");
        canvas.width = saved.naturalWidth;
        canvas.height = saved.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(saved, 0, 0);
        return {
          native,
          fallback,
          export: {
            type: blob.type,
            width: canvas.width,
            height: canvas.height,
            top: [...ctx.getImageData(15, 20, 1, 1).data],
            bottom: [...ctx.getImageData(15, 60, 1, 1).data],
          },
        };
      } finally {
        URL.revokeObjectURL(url);
      }
    });
    reference ??= result.native;
    for (const [mode, cases] of [
      ["native", result.native],
      ["fallback", result.fallback],
    ]) {
      cases.forEach((actual, index) => {
        const expected = reference[index];
        assert.equal(actual.width, expected.width);
        assert.equal(actual.height, expected.height);
        actual.pixels.forEach((channel, component) =>
          assert.ok(
            Math.abs(channel - expected.pixels[component]) <= 3,
            `${engine.name()} ${mode} recipe ${index}, component ${component}: ${channel} vs ${expected.pixels[component]}`,
          ),
        );
      });
    }
    assert.equal(result.export.type, "image/jpeg");
    assert.equal(result.export.width, 30);
    assert.equal(result.export.height, 80);
    for (const [actual, expected] of [
      [result.export.top, [40, 180, 80, 255]],
      [result.export.bottom, [255, 80, 40, 255]],
    ]) {
      actual.forEach((channel, index) =>
        assert.ok(
          Math.abs(channel - expected[index]) <= 4,
          `${engine.name()} exported pixel ${actual} vs ${expected}`,
        ),
      );
    }
    console.log(
      `${engine.name()}: native/fallback recipes and decoded JPEG color, rotation, crop passed`,
    );
  } finally {
    await browser.close();
  }
}
