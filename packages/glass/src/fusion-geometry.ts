import type { FusionShape } from "./fusion.js";
import type { OpticalPoint } from "./refraction.js";
type DistanceField = ((x: number, y: number) => OpticalPoint) & {
  signedDistance(x: number, y: number): number;
  materialRows?: { top: number; height: number; count: number };
  roundedRect?: { x: number; y: number; width: number; height: number; radius: number };
};
export type FusionEdgePixels = Uint8Array & { indices?: number[] };

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
  const blends = shapes.map((_, index) => {
    if (!index) return 0;
    if (grouped) return Math.min(4, limit / 4);
    // A fixed smooth union keeps the neck rounded as contact increases. Its
    // zero contour pinches naturally instead of replacing the field at a gap cutoff.
    return Math.min(limit, Math.max(0, spacing));
  });
  const lenses = shapes.map((shape, index) => ({
    ...shape,
    halfWidth: shape.width / 2,
    halfHeight: shape.height / 2,
    thickness: Math.min(24, Math.max(8, Math.min(shape.width, shape.height) * 0.2)),
    blend: blends[index]!,
  }));
  const sample = (x: number, y: number): OpticalPoint => {
    let distance = -Infinity;
    let nx = 0,
      ny = 0,
      localY = 0,
      localHeight = 1,
      thickness = 0;
    for (let index = 0; index < lenses.length; index++) {
      const shape = lenses[index]!;
      const blend = shape.blend;
      const px = x - shape.x - shape.halfWidth;
      const py = y - shape.y - shape.halfHeight;
      const radius = shape.corners?.[py < 0 ? (px < 0 ? 0 : 1) : px < 0 ? 3 : 2] ?? shape.radius;
      const qx = Math.abs(px) - (shape.halfWidth - radius);
      const qy = Math.abs(py) - (shape.halfHeight - radius);
      const ox = Math.max(qx, 0),
        oy = Math.max(qy, 0);
      const length = Math.sqrt(ox * ox + oy * oy);
      const d = radius - length - Math.min(Math.max(qx, qy), 0);
      const weight =
        Number.isFinite(distance) && blend > 0
          ? Math.max(0, Math.min(1, 0.5 + (0.5 * (d - distance)) / blend))
          : d > distance
            ? 1
            : 0;
      if (weight === 0) continue;
      const sx = length ? (ox / length) * Math.sign(px) : qx > qy ? Math.sign(px) : 0;
      const sy = length ? (oy / length) * Math.sign(py) : qx > qy ? 0 : Math.sign(py);
      if (weight === 1) {
        distance = d;
        nx = sx;
        ny = sy;
        localY = y - shape.y;
        localHeight = shape.height;
        thickness = shape.thickness;
        continue;
      }
      distance = Number.isFinite(distance)
        ? distance * (1 - weight) + d * weight + blend * weight * (1 - weight)
        : d;
      nx = nx * (1 - weight) + sx * weight;
      ny = ny * (1 - weight) + sy * weight;
      localY = localY * (1 - weight) + (y - shape.y) * weight;
      localHeight = localHeight * (1 - weight) + shape.height * weight;
      thickness = thickness * (1 - weight) + shape.thickness * weight;
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
  const rectangle =
    group?.progress === 0 ? group.hull : shapes.length === 1 ? shapes[0] : undefined;
  if (rectangle && (!rectangle.corners || rectangle.corners.every((r) => r === rectangle.radius)))
    (sample as DistanceField).roundedRect = rectangle;
  const first = shapes[0];
  if (
    first &&
    first.height > 0 &&
    shapes.every((shape) => shape.y === first.y && shape.height === first.height) &&
    (!group || (group.hull.y === first.y && group.hull.height === first.height))
  )
    (sample as DistanceField).materialRows = {
      top: first.y,
      height: first.height,
      count: shapes.length + (group ? 1 : 0),
    };
  // Contour coverage needs only distance, not normals or local material coordinates.
  sample.signedDistance = (x: number, y: number) => {
    let distance = -Infinity;
    for (let index = 0; index < lenses.length; index++) {
      const shape = lenses[index]!;
      const blend = shape.blend;
      const px = x - shape.x - shape.halfWidth,
        py = y - shape.y - shape.halfHeight;
      const radius = shape.corners?.[py < 0 ? (px < 0 ? 0 : 1) : px < 0 ? 3 : 2] ?? shape.radius;
      const qx = Math.abs(px) - (shape.halfWidth - radius);
      const qy = Math.abs(py) - (shape.halfHeight - radius);
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

// Contour tracing adapted from onlymoein/liquidglass 89f8b736 (MIT).
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
// Modified: shared positive distance field, per-corner geometry and subpixel interpolation.
export function fusionOutline(
  width: number,
  height: number,
  shapes: FusionShape[],
  spacing: number,
  grouped = false,
  edgePixels?: FusionEdgePixels,
) {
  if (edgePixels) edgePixels.indices = [];
  const distance = fusionGeometry(shapes, spacing, grouped).signedDistance;
  const step = 1.5;
  const columns = Math.ceil(width / step) + 1;
  const rows = Math.ceil(height / step) + 1;
  const field = new Float32Array(columns * rows);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      field[row * columns + column] = -distance(column * step, row * step);
    }
  }
  const at = (column: number, row: number) => field[row * columns + column]!;
  // Directed grid-edge indices retain the original insertion/tracing order
  // without constructing string keys or allocating a point object per edge.
  const slots = columns * rows * 2;
  const next = new Int32Array(slots).fill(-1);
  const px = new Float64Array(slots),
    py = new Float64Array(slots);
  const located = new Uint8Array(slots),
    order: number[] = [];
  const edge = (column: number, row: number, across: boolean) => {
    const key = (row * columns + column) * 2 + (across ? 1 : 0);
    if (!located[key]) {
      const a = at(column, row),
        b = across ? at(column + 1, row) : at(column, row + 1);
      const t = a / (a - b);
      px[key] = across ? (column + t) * step : column * step;
      py[key] = across ? row * step : (row + t) * step;
      located[key] = 1;
    }
    return key;
  };
  for (let row = 0; row < rows - 1; row++) {
    for (let column = 0; column < columns - 1; column++) {
      const a = at(column, row) < 0;
      const b = at(column + 1, row) < 0;
      const c = at(column + 1, row + 1) < 0;
      const d = at(column, row + 1) < 0;
      if (a === b && b === c && c === d) continue;
      const top = () => edge(column, row, true);
      const right = () => edge(column + 1, row, false);
      const bottom = () => edge(column, row + 1, true);
      const left = () => edge(column, row, false);
      // Each segment runs with the inside on one hand, so outlines chain up.
      const link = (from: number, to: number) => {
        if (next[from] === -1) order.push(from);
        next[from] = to;
      };
      const code = (a ? 8 : 0) | (b ? 4 : 0) | (c ? 2 : 0) | (d ? 1 : 0);
      switch (code) {
        case 1:
          link(bottom(), left());
          break;
        case 2:
          link(right(), bottom());
          break;
        case 3:
          link(right(), left());
          break;
        case 4:
          link(top(), right());
          break;
        case 5:
          link(top(), left());
          link(bottom(), right());
          break;
        case 6:
          link(top(), bottom());
          break;
        case 7:
          link(top(), left());
          break;
        case 8:
          link(left(), top());
          break;
        case 9:
          link(bottom(), top());
          break;
        case 10:
          link(left(), bottom());
          link(right(), top());
          break;
        case 11:
          link(right(), top());
          break;
        case 12:
          link(left(), right());
          break;
        case 13:
          link(bottom(), right());
          break;
        case 14:
          link(left(), bottom());
          break;
      }
    }
  }
  const pixelWidth = Math.ceil(width * 2),
    pixelHeight = Math.ceil(height * 2);
  const mark = (from: number, to: number) => {
    if (!edgePixels) return;
    // Two device pixels cover antialiasing and the one-pixel inner erosion.
    const left = Math.max(0, Math.floor(Math.min(px[from]!, px[to]!) * 2 - 2));
    const right = Math.min(pixelWidth, Math.ceil(Math.max(px[from]!, px[to]!) * 2 + 2));
    const top = Math.max(0, Math.floor(Math.min(py[from]!, py[to]!) * 2 - 2));
    const bottom = Math.min(pixelHeight, Math.ceil(Math.max(py[from]!, py[to]!) * 2 + 2));
    for (let row = top; row < bottom; row++)
      for (let column = left; column < right; column++) {
        const index = row * pixelWidth + column;
        if (edgePixels[index]) continue;
        edgePixels[index] = 1;
        edgePixels.indices!.push(index);
      }
  };
  let path = "";
  const seen = new Uint8Array(slots);
  for (const start of order) {
    if (seen[start]) continue;
    let key = start,
      previous = -1;
    let first = true;
    while (key >= 0 && !seen[key]) {
      seen[key] = 1;
      const x = px[key]!,
        y = py[key]!;
      if (previous >= 0) mark(previous, key);
      path += `${first ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      first = false;
      previous = key;
      key = next[key]!;
    }
    if (previous >= 0) mark(previous, start);
    path += "Z";
  }
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><path fill="white" d="${path}"/></svg>`)}`;
}
