export interface SectionPoint {
  value: string;
  center: number;
  disabled: boolean;
}
// Stable ties retain authored order, as the source index does.
export function nearestSection(points: readonly SectionPoint[], y: number) {
  let nearest: SectionPoint | undefined,
    distance = Infinity;
  for (const point of points) {
    const next = Math.abs(y - point.center);
    if (!point.disabled && next < distance) {
      nearest = point;
      distance = next;
    }
  }
  return nearest?.value;
}
