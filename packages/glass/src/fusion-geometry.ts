import type { FusionShape } from "./fusion.js";
import type { OpticalPoint } from "./refraction.js";
type DistanceField = ((x: number, y: number) => OpticalPoint) & {
  signedDistance(x: number, y: number): number;
};

function corner(shape: FusionShape, index: number) {
  return shape.corners?.[index] ?? shape.radius;
}

export function groupedGeometry(shapes: FusionShape[]) {
  if (shapes.length < 2) return undefined;
  const xs = shapes.map((s) => s.x + s.width / 2),
    ys = shapes.map((s) => s.y + s.height / 2);
  const vertical = Math.max(...ys) - Math.min(...ys) > Math.max(...xs) - Math.min(...xs);
  const ordered = [...shapes].sort((a, b) => (vertical ? a.y - b.y : a.x - b.x));
  let progress = 0;
  for (let i = 1; i < ordered.length; i++) {
    const a = ordered[i - 1]!,
      b = ordered[i]!;
    const aRadius = Math.min(a.width, a.height) / 2,
      bRadius = Math.min(b.width, b.height) / 2;
    progress += vertical
      ? (corner(a, 2) + corner(a, 3)) / (2 * aRadius) +
        (corner(b, 0) + corner(b, 1)) / (2 * bRadius)
      : (corner(a, 1) + corner(a, 2)) / (2 * aRadius) +
        (corner(b, 0) + corner(b, 3)) / (2 * bRadius);
  }
  const first = ordered[0]!,
    last = ordered.at(-1)!;
  const x = Math.min(...shapes.map((s) => s.x)),
    y = Math.min(...shapes.map((s) => s.y));
  const fraction = progress / (2 * (ordered.length - 1));
  return {
    progress: fraction > 1 - 1e-4 ? 1 : Math.min(1, Math.max(0, fraction)),
    hull: {
      x,
      y,
      width: Math.max(...shapes.map((s) => s.x + s.width)) - x,
      height: Math.max(...shapes.map((s) => s.y + s.height)) - y,
      radius: first.radius,
      corners: vertical
        ? ([corner(first, 0), corner(first, 1), corner(last, 2), corner(last, 3)] as const)
        : ([corner(first, 0), corner(last, 1), corner(last, 2), corner(first, 3)] as const),
    },
  };
}

/** The isolated rounded-rectangle lens and the neck use the same distance convention. */
export function fusionGeometry(
  shapes: FusionShape[],
  spacing: number,
  grouped = false,
): DistanceField {
  const group = grouped ? groupedGeometry(shapes) : undefined;
  const hull = group ? fusionGeometry([group.hull], 0) : undefined;
  const progress = group?.progress ?? 1;
  const limit = Math.min(...shapes.map((s) => Math.min(s.width, s.height)));
  const blends = shapes.map((shape, index) => {
    if (!index) return 0;
    if (grouped) return Math.min(4, limit / 4);
    const gap = Math.min(
      ...shapes
        .slice(0, index)
        .map((other) =>
          Math.hypot(
            Math.max(shape.x - other.x - other.width, other.x - shape.x - shape.width, 0),
            Math.max(shape.y - other.y - other.height, other.y - shape.y - shape.height, 0),
          ),
        ),
    );
    // Start with a thin neck at the threshold, then limit swelling as the gap closes.
    return gap < spacing
      ? Math.min(limit, 2 * gap + Math.min(4, limit / 4) * (1 - gap / spacing))
      : 0;
  });
  const sample = (x: number, y: number): OpticalPoint => {
    let distance = -Infinity;
    let nx = 0,
      ny = 0,
      localY = 0,
      localHeight = 1,
      thickness = 0;
    for (let index = 0; index < shapes.length; index++) {
      const shape = shapes[index]!;
      const blend = blends[index]!;
      const px = x - shape.x - shape.width / 2;
      const py = y - shape.y - shape.height / 2;
      const radius = shape.corners?.[py < 0 ? (px < 0 ? 0 : 1) : px < 0 ? 3 : 2] ?? shape.radius;
      const qx = Math.abs(px) - (shape.width / 2 - radius);
      const qy = Math.abs(py) - (shape.height / 2 - radius);
      const ox = Math.max(qx, 0),
        oy = Math.max(qy, 0);
      const length = Math.sqrt(ox * ox + oy * oy);
      const d = radius - length - Math.min(Math.max(qx, qy), 0);
      const sx = length ? (ox / length) * Math.sign(px) : qx > qy ? Math.sign(px) : 0;
      const sy = length ? (oy / length) * Math.sign(py) : qx > qy ? 0 : Math.sign(py);
      const weight =
        Number.isFinite(distance) && blend > 0
          ? Math.max(0, Math.min(1, 0.5 + (0.5 * (d - distance)) / blend))
          : d > distance
            ? 1
            : 0;
      distance = Number.isFinite(distance)
        ? distance * (1 - weight) + d * weight + blend * weight * (1 - weight)
        : d;
      nx = nx * (1 - weight) + sx * weight;
      ny = ny * (1 - weight) + sy * weight;
      localY = localY * (1 - weight) + (y - shape.y) * weight;
      localHeight = localHeight * (1 - weight) + shape.height * weight;
      thickness =
        thickness * (1 - weight) +
        Math.min(24, Math.max(8, Math.min(shape.width, shape.height) * 0.2)) * weight;
    }
    if (hull && progress < 1) {
      const joined = hull(x, y);
      distance = joined.distance * (1 - progress) + distance * progress;
      nx = joined.nx * (1 - progress) + nx * progress;
      ny = joined.ny * (1 - progress) + ny * progress;
      localY = joined.localY! * (1 - progress) + localY * progress;
      localHeight = joined.localHeight! * (1 - progress) + localHeight * progress;
      thickness = joined.thickness! * (1 - progress) + thickness * progress;
    }
    const length = Math.sqrt(nx * nx + ny * ny) || 1;
    return { distance, nx: nx / length, ny: ny / length, localY, localHeight, thickness };
  };
  // Contour coverage needs only distance, not normals or local material coordinates.
  sample.signedDistance = (x: number, y: number) => {
    let distance = -Infinity;
    for (let index = 0; index < shapes.length; index++) {
      const shape = shapes[index]!;
      const blend = blends[index]!;
      const px = x - shape.x - shape.width / 2,
        py = y - shape.y - shape.height / 2;
      const radius = shape.corners?.[py < 0 ? (px < 0 ? 0 : 1) : px < 0 ? 3 : 2] ?? shape.radius;
      const qx = Math.abs(px) - (shape.width / 2 - radius);
      const qy = Math.abs(py) - (shape.height / 2 - radius);
      const ox = Math.max(qx, 0),
        oy = Math.max(qy, 0);
      const d = radius - Math.sqrt(ox * ox + oy * oy) - Math.min(Math.max(qx, qy), 0);
      const delta = blend > 0 ? Math.max(blend - Math.abs(d - distance), 0) / blend : 0;
      distance = Math.max(distance, d) + delta * delta * blend * 0.25;
    }
    return hull && progress < 1
      ? hull.signedDistance(x, y) * (1 - progress) + distance * progress
      : distance;
  };
  return sample;
}

/** Subpixel scanlines keep the same outline available without regenerating optical maps. */
export function fusionOutline(
  width: number,
  height: number,
  shapes: FusionShape[],
  spacing: number,
  grouped = false,
) {
  const distance = fusionGeometry(shapes, spacing, grouped).signedDistance;
  const paths: string[] = [];
  for (let y = 0; y < height; y += 0.5) {
    let start = 0;
    let previous = distance(0, y + 0.25);
    for (let x = 1; x <= width; x++) {
      const next = distance(x, y + 0.25);
      if (previous > 0 !== next > 0) {
        const edge = x - 1 + previous / (previous - next);
        if (next > 0) start = edge;
        else
          paths.push(
            `M${start.toFixed(2)},${y}h${(edge - start).toFixed(2)}v.5H${start.toFixed(2)}z`,
          );
      }
      previous = next;
    }
    if (previous > 0)
      paths.push(`M${start.toFixed(2)},${y}h${width - start}v.5H${start.toFixed(2)}z`);
  }
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path fill="white" d="${paths.join("")}"/></svg>`)}`;
}
