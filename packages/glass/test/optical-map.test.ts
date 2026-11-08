import { expect, test } from "bun:test";
import { inflateSync } from "node:zlib";
import { encodeOpticalMap } from "../src/canvas.js";

// Independently decompress PNG output to catch corrupt alpha, row filters and
// large-map checksums in both canvas snapshots and generated optical maps.
for (const size of [2, 130]) {
  test(`lossless optical PNG preserves RGBA across ${size}px rows`, async () => {
    const data = Uint8ClampedArray.from({ length: size * size * 4 }, (_, i) => (i * 37) % 256);
    const url = await encodeOpticalMap({ width: size, height: size, data });
    const png = Buffer.from(url.split(",")[1]!, "base64");
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(size);
    expect(png.readUInt32BE(20)).toBe(size);
    const length = png.readUInt32BE(33);
    const decoded = inflateSync(png.subarray(41, 41 + length));
    for (let y = 0; y < size; y++) {
      const at = y * (size * 4 + 1);
      expect(decoded[at]).toBe(0);
      expect([...decoded.subarray(at + 1, at + 1 + size * 4)]).toEqual([
        ...data.subarray(y * size * 4, (y + 1) * size * 4),
      ]);
    }
  });
}
