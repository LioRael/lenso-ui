/** Overlapping blur bands, ordered from the clear edge toward the bar. */
export const softEdgeBands = [
  { radius: 0.2125, start: 12.5, end: 100 },
  { radius: 0.425, start: 7.5, end: 95 },
  { radius: 0.85, start: 5, end: 92.5 },
  { radius: 1.7, start: 2.5, end: 90 },
  { radius: 3.4, start: 0, end: 87.5 },
  // A separate bar shoulder strengthens the top without softening the middle.
  { radius: 4.2, start: 0, end: 25 },
].map(({ radius, start, end }, index, levels) => {
  // Successive filters sample earlier bands: Gaussian variances, not radii, add.
  const previous = levels[index - 1]?.radius ?? 0;
  return { blur: Math.sqrt(radius ** 2 - previous ** 2), mask: softEdgeMask(start, end) };
});

export const softEdgeTintMask = softEdgeMask(0, 100, 1.35);

/** Raised-cosine falloff has zero slope at both ends of each band. */
export function softEdgeMask(start = 0, end = 100, power = 1) {
  const stops = Array.from({ length: 17 }, (_, index) => {
    const t = index / 16;
    const alpha = ((1 + Math.cos(Math.PI * t)) / 2) ** power;
    return `rgb(0 0 0 / ${alpha.toFixed(5)}) ${start + (end - start) * t}%`;
  });
  return `linear-gradient(var(--material-edge-direction), ${stops.join(", ")})`;
}
