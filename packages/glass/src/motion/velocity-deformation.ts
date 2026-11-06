import { createSpring, prefersReducedMotion } from "./spring.js";

// Shared magnifier deformation model; compact controls may bound amplitude.
export const deformationSpring = [150, 19] as const;
export const velocityDeformation = (speed: number, maximum = 0.3) =>
  Math.min(maximum, 0.00018 * Math.abs(speed));

// Native controls may stop emitting positions while held. Relax after the last
// sample instead of keeping a frame loop alive to poll their geometry.
export function createVelocityDeformation(maximum: number, paint: (value: number) => void) {
  let previous: number | undefined;
  let time = 0;
  let idle = 0;
  const spring = createSpring(0, ...deformationSpring, paint);
  return {
    sample(position: number) {
      const now = performance.now();
      const elapsed = now - time;
      const speed =
        previous !== undefined && elapsed > 0 && elapsed < 100
          ? ((position - previous) * 1000) / elapsed
          : 0;
      previous = position;
      time = now;
      spring.set(prefersReducedMotion() ? 0 : velocityDeformation(speed, maximum));
      clearTimeout(idle);
      idle = window.setTimeout(() => spring.set(0), 80);
    },
    stop() {
      clearTimeout(idle);
      spring.stop();
    },
  };
}
