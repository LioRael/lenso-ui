// Displacement-only benchmark adapted from MIT-licensed work by Kelvin Zhang.
// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
export function generateTs(
  width: number,
  height: number,
  radius: number,
  bezel: number,
  thickness: number,
  quarter = false,
): Uint8Array {
  const samples = new Float32Array(128);
  let maximum = 0;
  for (let i = 0; i < 128; i++) {
    const t = Math.max(0.001, i / 127),
      surface = (1 - (1 - t) ** 4) ** 0.25;
    const incident = Math.atan((1 - t) ** 3 / surface ** 3);
    samples[i] =
      Math.tan(incident - Math.asin(Math.sin(incident) / 1.5)) * (thickness + surface * bezel);
    maximum = Math.max(maximum, samples[i]!);
  }
  const cols = width * 2,
    rows = height * 2,
    pixels = new Uint8Array(cols * rows * 4);
  const write = (x: number, y: number, r: number, g: number) => {
    const at = (y * cols + x) * 4;
    pixels[at] = Math.round(127.5 + r);
    pixels[at + 1] = Math.round(127.5 + g);
    pixels[at + 2] = 128;
    pixels[at + 3] = 255;
  };
  for (let y = 0; y < (quarter ? height : rows); y++) {
    const py = (y + 0.5) / 2 - height / 2,
      qy = Math.abs(py) - (height / 2 - radius),
      oy = Math.max(qy, 0);
    for (let x = 0; x < (quarter ? width : cols); x++) {
      const px = (x + 0.5) / 2 - width / 2,
        qx = Math.abs(px) - (width / 2 - radius),
        ox = Math.max(qx, 0);
      const length = Math.hypot(ox, oy),
        distance = radius - (length + Math.min(Math.max(qx, qy), 0));
      const nx = length > 0 ? (ox / length) * Math.sign(px) : qx > qy ? Math.sign(px) : 0;
      const ny = length > 0 ? (oy / length) * Math.sign(py) : qx > qy ? 0 : Math.sign(py);
      let shift = 0;
      if (distance >= 0 && distance < bezel) {
        const at = (distance / bezel) * 127,
          lower = Math.floor(at);
        shift =
          samples[lower]! + (samples[Math.min(lower + 1, 127)]! - samples[lower]!) * (at - lower);
      }
      const r = ((-nx * shift) / maximum) * 127.5,
        g = ((-ny * shift) / maximum) * 127.5;
      write(x, y, r, g);
      if (quarter) {
        write(cols - 1 - x, y, -r, g);
        write(x, rows - 1 - y, r, -g);
        write(cols - 1 - x, rows - 1 - y, -r, -g);
      }
    }
  }
  return pixels;
}
