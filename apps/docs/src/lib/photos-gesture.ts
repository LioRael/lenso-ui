export type PhotoPose = {
  x: number;
  y: number;
  scale: number;
  background: number;
  controls: number;
};

export type PhotoPointerSample = { x: number; y: number; time: number };

export const restingPhoto: PhotoPose = { x: 0, y: 0, scale: 1, background: 1, controls: 1 };

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

function progress(y: number, height: number) {
  return clamp(y / (height * 0.4), 0, 1);
}

export function draggedPhoto(
  base: PhotoPose,
  dx: number,
  dy: number,
  height: number,
  reduced: boolean,
): PhotoPose {
  const y = base.y + (dy < -base.y ? -base.y + (dy + base.y) * 0.22 : dy);
  const delta = progress(y, height) - progress(base.y, height);
  return {
    x: base.x + dx,
    y,
    scale: reduced ? 1 : clamp(base.scale - delta * 0.3, 0.65, 1),
    background: clamp(base.background - delta, 0, 1),
    controls: clamp(base.controls - delta * 7, 0, 1),
  };
}

export function photoReleaseVelocity(samples: readonly PhotoPointerSample[], time: number) {
  const last = samples.at(-1);
  if (!last || time - last.time > 80) return { x: 0, y: 0 };
  const end = last;
  function axisVelocity(axis: "x" | "y") {
    let index = samples.length - 2;
    if (index < 0) return 0;
    const direction = Math.sign(end[axis] - samples[index]![axis]);
    if (!direction) return 0;
    while (
      index > 0 &&
      end.time - samples[index - 1]!.time <= 80 &&
      Math.sign(samples[index]![axis] - samples[index - 1]![axis]) === direction
    )
      index--;
    const first = samples[index]!;
    const elapsed = end.time - first.time;
    return elapsed > 0 ? clamp((end[axis] - first[axis]) / elapsed, -3, 3) : 0;
  }
  return { x: axisVelocity("x"), y: axisVelocity("y") };
}

export function shouldDismissPhoto(y: number, velocity: number, height: number) {
  return (y >= Math.min(160, height * 0.22) && velocity >= -0.25) || (y >= 32 && velocity >= 0.65);
}

// The existing glass release uses stiffness 230 and damping 31, with unit mass.
export function returningValue(position: number, velocity: number, seconds: number) {
  const halfDamping = 31 / 2;
  const root = Math.sqrt(halfDamping ** 2 - 230);
  return (
    Math.exp(-halfDamping * seconds) *
    (position * Math.cosh(root * seconds) +
      ((velocity + halfDamping * position) / root) * Math.sinh(root * seconds))
  );
}

export function photoReturnFrames(pose: PhotoPose, velocity: { x: number; y: number }) {
  return Array.from({ length: 37 }, (_, index): PhotoPose => {
    if (index === 36) return restingPhoto;
    const time = index / 60;
    return {
      x: returningValue(pose.x, velocity.x * 1000, time),
      y: returningValue(pose.y, velocity.y * 1000, time),
      scale: clamp(1 + returningValue(pose.scale - 1, 0, time), 0.65, 1),
      background: clamp(1 + returningValue(pose.background - 1, 0, time), 0, 1),
      controls: clamp(1 + returningValue(pose.controls - 1, 0, time), 0, 1),
    };
  });
}
