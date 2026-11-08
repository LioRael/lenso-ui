// Physical iPhone captures: Files More and the twelve-action native probe.
// Tables retain the measured shape; monotone cubic interpolation removes knot
// velocity jumps. See docs/research/menu-continuous-expansion.md for limits.
type Frame = readonly [
  ms: number,
  x: number,
  y: number,
  width: number,
  height: number,
  corner: number,
];
const short: readonly Frame[] = [
  [0, 550, 88, 66, 66, 33],
  [39, 474, 109, 121, 111, 55.5],
  [63, 387, 117, 214, 169, 84.5],
  [104, 320, 119, 286, 200, 100],
  [139, 267, 112, 343, 216, 108],
  [174, 245, 104, 368, 219, 105],
  [217, 232, 94, 384, 221, 73.4],
  [244, 231, 91, 386, 221, 64.5],
  [283, 233, 88, 384, 221, 53],
  [328, 236, 87, 380, 220, 48.8],
  [357, 238, 87, 378, 221, 48.8],
  [397, 239, 87, 377, 221, 48.8],
  [442, 240, 88, 376, 220, 48.8],
];

const tall: readonly Frame[] = [
  [0, 290, 404, 66, 66, 33],
  [37, 296, 410, 53, 100, 26.5],
  [79, 244, 550, 162, 160, 80],
  [117, 188, 549, 266, 413, 133],
  [150, 157, 477, 326, 615, 110],
  [184, 139, 410, 363, 761, 75],
  [233, 127, 410, 387, 804, 54],
  [254, 118, 402, 402, 814, 50],
  [286, 120, 398, 396, 814, 49],
  [324, 126, 398, 388, 806, 49],
  [354, 128, 399, 384, 799, 49],
  [392, 129, 401, 383, 793, 49],
  [442, 134, 410, 376, 790, 49],
];
const clamp = (n: number) => Math.max(0, Math.min(1, n));
function profile(
  rows: readonly Frame[],
  sourceY: number,
  targetY: number,
  targetHeight: number,
  radius: number,
  diagonal = false,
) {
  const data = rows.map(([t, x, y, w, h, r]) => {
    const half = Math.min(w, h) / 2;
    const centre = (y + h / 2 - sourceY) / (targetY + targetHeight / 2 - sourceY);
    return [
      t,
      (w - 66) / 310,
      (h - 66) / (targetHeight - 66),
      centre,
      r >= half ? 1 : clamp((r - radius) / (half - radius)),
      diagonal ? (x + w / 2 - 583) / (428 - 583) : centre,
    ];
  });
  const slopes = data.map((row, i) =>
    row.map((_, k) => {
      if (i === 0 || i === data.length - 1) return 0;
      const before = data[i - 1]!,
        after = data[i + 1]!;
      const a = row[0]! - before[0]!,
        b = after[0]! - row[0]!;
      const left = (row[k]! - before[k]!) / a,
        right = (after[k]! - row[k]!) / b;
      if (left * right <= 0) return 0;
      return (3 * (a + b)) / ((a + 2 * b) / left + (2 * a + b) / right);
    }),
  );
  return (time: number) => {
    const t = Math.max(0, Math.min(rows[rows.length - 1]![0], time));
    const i = Math.max(
      1,
      data.findIndex((row) => row[0]! >= t),
    );
    const a = data[i - 1]!,
      b = data[i]!,
      h = b[0]! - a[0]!,
      u = (t - a[0]!) / h;
    return a.map(
      (v, k) =>
        (2 * u ** 3 - 3 * u ** 2 + 1) * v +
        (u ** 3 - 2 * u ** 2 + u) * h * slopes[i - 1]![k]! +
        (-2 * u ** 3 + 3 * u ** 2) * b[k]! +
        (u ** 3 - u ** 2) * h * slopes[i]![k]!,
    );
  };
}
const compact = profile(short, 121, 88, 220, 48.8, true);
const extended = profile(tall, 437, 410, 790, 49);

/** One continuous height/centre trajectory; roundness never gates extra rows. */
export function sampleMenuOpening(
  time: number,
  from: { x: number; y: number; width: number; height: number },
  to: { width: number; height: number },
  radius: number,
) {
  const mix = clamp((to.height / to.width - 220 / 376) / ((790 - 220) / 376));
  const a = compact(time),
    b = extended(time);
  const [, u, v, cy, round, cx] = a.map((n, i) => n + (b[i]! - n) * mix) as [
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  const residual = time >= 442 ? 0 : Math.exp(-((time / 44) ** 2));
  const width = Math.max(
    0.01,
    from.height + (to.width - from.height) * u + (from.width - from.height) * residual,
  );
  const height = Math.max(0.01, from.height + (to.height - from.height) * v);
  return {
    width,
    height,
    left: from.x + from.width / 2 + (to.width / 2 - from.x - from.width / 2) * cx - width / 2,
    top: from.y + from.height / 2 + (to.height / 2 - from.y - from.height / 2) * cy - height / 2,
    corner: (Math.min(width, height) / 2) * round + radius * (1 - round),
    progress: clamp(v),
  };
}

export function menuInk(time: number, open: boolean, duration: number) {
  const remaining = Math.max(0, 1 - time / duration);
  return {
    blur: open ? 5 * Math.max(0, 1 - time / 360) ** 2 : 4 * Math.min(1, time / 160),
    refraction: open ? remaining ** 1.5 : Math.min(1, time / 160),
  };
}

// Files More's compact exit, with the last unobserved interval aligned to the
// source before paint handoff. The tall bounds are from the twelve-action
// physical probe, frames 75–79; its corner channel follows the compact capture.
const compactExit = profile(
  [
    [0, 240, 88, 376, 220, 48.8],
    [49, 259, 116, 357, 217, 71.7],
    [80, 313, 127, 298, 203, 79.9],
    [112, 375, 120, 232, 178, 78.9],
    [149, 431, 107, 172, 149, 74.5],
    [188, 487, 100, 113, 107, 53.5],
    [299, 550, 88, 66, 66, 33],
  ],
  121,
  88,
  220,
  48.8,
  true,
);
const tallExit = profile(
  [
    [0, 130, 404, 380, 784, 0],
    [51, 152, 489, 337, 654, 0],
    [77, 183, 550, 275, 419, 0],
    [104, 216, 549, 211, 304, 0],
    [166, 271, 462, 103, 85, 0],
    [299, 290, 404, 66, 66, 0],
  ],
  437,
  404,
  784,
  0,
);
// The tall capture's terminal width is 380 rather than the compact 376.
const tallWidth = (380 - 66) / (376 - 66);

export function sampleMenuClosing(
  time: number,
  from: { x: number; y: number; width: number; height: number },
  to: { width: number; height: number },
  radius: number,
) {
  const mix = clamp((to.height / to.width - 220 / 376) / (784 / 380 - 220 / 376));
  const a = compactExit(time),
    b = tallExit(time);
  const u = a[1]! + (b[1]! / tallWidth - a[1]!) * mix;
  const v = a[2]! + (b[2]! - a[2]!) * mix;
  const cy = a[3]! + (b[3]! - a[3]!) * mix;
  const width = from.width + (to.width - from.width) * u;
  const height = from.height + (to.height - from.height) * v;
  const round = a[4]!;
  return {
    width,
    height,
    left: from.x + from.width / 2 + (to.width / 2 - from.x - from.width / 2) * a[5]! - width / 2,
    top: from.y + from.height / 2 + (to.height / 2 - from.y - from.height / 2) * cy - height / 2,
    corner: (Math.min(width, height) / 2) * round + radius * (1 - round),
    progress: clamp(v),
  };
}

// Source-paint rebound from the same physical Files capture; no panel-height tail.
const sourceReturn = [
  [299, 64, -6],
  [343, 66, -4],
  [381, 67, -2.5],
  [418, 67, -1.5],
  [455, 67, 0],
  [491, 67, 0],
  [533, 66, 0],
] as const;
export function sampleMenuSourceReturn(time: number, height: number) {
  const t = Math.max(299, Math.min(533, time));
  const i = Math.max(
    1,
    sourceReturn.findIndex((row) => row[0] >= t),
  );
  const a = sourceReturn[i - 1]!,
    b = sourceReturn[i]!;
  const u = (t - a[0]) / (b[0] - a[0]);
  return {
    scale: (a[1] + (b[1] - a[1]) * u) / 66,
    lift: ((a[2] + (b[2] - a[2]) * u) * height) / 66,
  };
}
