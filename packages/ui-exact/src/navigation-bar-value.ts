// Geometry and progressive band model adapted from Lenso's scroll-edge and soft-edge helpers.
export function navigationEdgeVisibility(
  offset: number,
  scrollSize: number,
  clientSize: number,
  extent: number,
) {
  const maximum = Math.max(0, scrollSize - clientSize);
  const position = Math.min(maximum, Math.max(0, offset));
  return maximum <= 1 ? 0 : Math.min(1, position / Math.max(1, Math.min(24, extent * 0.4)));
}
function mask(start = 0, end = 100, power = 1) {
  const stops = Array.from({ length: 17 }, (_, index) => {
    const t = index / 16,
      alpha = ((1 + Math.cos(Math.PI * t)) / 2) ** power;
    return `rgb(0 0 0 / ${alpha.toFixed(5)}) ${start + (end - start) * t}%`;
  });
  return `linear-gradient(var(--material-edge-direction), ${stops.join(", ")})`;
}
const bands = [
  [0.2125, 12.5, 100],
  [0.425, 7.5, 95],
  [0.85, 5, 92.5],
  [1.7, 2.5, 90],
  [3.4, 0, 87.5],
  [4.2, 0, 25],
] as const;
export const navigationSoftBands = bands.map(([radius, start, end], index) => ({
  blur: `${Math.sqrt(radius ** 2 - (bands[index - 1]?.[0] ?? 0) ** 2)}px`,
  mask: mask(start, end),
}));
export const navigationSoftTintMask = mask(0, 100, 1.35);
