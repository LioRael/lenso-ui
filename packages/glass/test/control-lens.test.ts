import { expect, test } from "bun:test";
import { lensMap } from "../src/control-lens.js";

const digests = [
  "d501415d6d9d4c2861ab0c109b5897df84871b00a4aa2aa5d2ba9282bafb811c",
  "bc147de6ba1ce68ad53623ca238bf88a0dc60420d880ae705c0c83f54b7ef7e5",
];
for (const density of [1, 2]) {
  test(`control lens keeps independent neutral axes at pixel density ${density}`, () => {
    const result = lensMap(
      { width: 58, height: 38, radius: 19 },
      { strength: 0.45, dispersion: 1, depth: 2, dome: 6, splay: 0.4 },
      {
        angle: 45,
        glow: 0.4,
        spread: 0.5,
        glowPower: 1.5,
        edge: 0.5,
        edgeWidth: 2,
        edgePower: 1.5,
      },
      density,
    );
    // Neutral axes alone miss changes in curvature, lighting and edge coverage.
    const hash = new Bun.CryptoHasher("sha256");
    for (const map of [result.across, result.down, result.light, result.shape]) hash.update(map);
    expect(hash.digest("hex")).toBe(digests[density - 1]!);
    for (const map of [result.across, result.down])
      for (let i = 0; i < map.length; i += 4) {
        expect(map[i]).toBe(map[i + 1]);
        expect(map[i]).toBe(map[i + 2]);
      }
    const center =
      (Math.floor(result.rows / 2) * result.columns + Math.floor(result.columns / 2)) * 4;
    expect(result.light[center + 3]).toBe(0);
    expect(result.shape[center + 3]).toBe(255);
    expect(
      result.across.some((value, index) => index % 4 === 0 && Math.abs(value - 128) > 10),
    ).toBe(true);
  });
}
