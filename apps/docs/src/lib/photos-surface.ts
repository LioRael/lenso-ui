export type ImagePose = { x: number; y: number; scale: number };
export type Point = { x: number; y: number };
export type ImageGeometry = {
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
};

export const imageRest: ImagePose = { x: 0, y: 0, scale: 1 };
export const maxImageScale = 4;

export function scaleAround(
  pose: ImagePose,
  origin: Point,
  destination: Point,
  scale: number,
): ImagePose {
  const ratio = scale / pose.scale;
  return {
    x: destination.x - (origin.x - pose.x) * ratio,
    y: destination.y - (origin.y - pose.y) * ratio,
    scale,
  };
}

function bounded(value: number, limit: number, elastic: boolean) {
  const clamped = Math.max(-limit, Math.min(limit, value));
  return clamped + (elastic ? (value - clamped) * 0.22 : 0);
}

export function boundImage(pose: ImagePose, geometry: ImageGeometry, elastic = false): ImagePose {
  return {
    scale: pose.scale,
    x: bounded(
      pose.x,
      Math.max(0, (geometry.width * pose.scale - geometry.viewportWidth) / 2),
      elastic,
    ),
    y: bounded(
      pose.y,
      Math.max(0, (geometry.height * pose.scale - geometry.viewportHeight) / 2),
      elastic,
    ),
  };
}

export function photoPageDirection(distance: number, velocity: number, width: number) {
  if (Math.abs(distance) >= width * 0.22 && distance * velocity >= -0.25 * Math.abs(distance))
    return distance < 0 ? 1 : -1;
  if (Math.abs(distance) >= 24 && Math.abs(velocity) >= 0.55 && distance * velocity > 0)
    return distance < 0 ? 1 : -1;
  return 0;
}
