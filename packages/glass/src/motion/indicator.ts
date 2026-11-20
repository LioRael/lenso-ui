// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted: one lift shared by indicators whose native parts own value and input.
import { createSpring } from "./spring.js";
import { createVelocityDeformation } from "./velocity-deformation.js";

export interface IndicatorState {
  /** 0 at rest, 1 while held. */
  lift: number;
  /** Fraction to stretch along the direction of movement. */
  stretch: number;
}

export interface IndicatorOptions {
  /** Largest stretch from movement speed, as a fraction of the indicator size. */
  stretch: number;
  /** Lift spring stiffness and damping; defaults to a knob's quick lift. */
  lift?: readonly [number, number];
  /** Knob CSS property prefix; writes `-lift-x`, `-lift-y` and `-face` when set. */
  property?: string;
  /** Runs after each change of lift, stretch or position, for the caller's geometry and optics. */
  onPaint?: (state: Readonly<IndicatorState>) => void;
}

export interface Indicator {
  /** Reports the indicator's position in pixels so its speed can stretch it. */
  move(position: number, instant?: boolean): void;
  /** Raises the indicator while it is held, and lowers it on release. */
  lift(lifted: boolean, instant?: boolean): void;
  /** Retunes the lift spring, such as between resting and dragging. */
  tune(stiffness: number, damping: number): void;
  /** Halts motion where it is; the indicator can move again afterwards. */
  stop(): void;
  destroy(): void;
}

/** Grows a held indicator and stretches it along fast movement. */
export function bindIndicator(
  element: HTMLElement,
  {
    stretch: maximum,
    lift: [stiffness, damping] = [2000, 80],
    property,
    onPaint,
  }: IndicatorOptions,
): Indicator {
  const state: IndicatorState = { lift: 0, stretch: 0 };
  const names = property
    ? ([`${property}-lift-x`, `${property}-lift-y`, `${property}-face`] as const)
    : undefined;
  const paintKnob = () => {
    if (!names) return;
    const { lift, stretch } = state;
    element.style.setProperty(names[0], String((38 / 58 + (20 / 58) * lift) * (1 + stretch)));
    element.style.setProperty(names[1], String((24 / 38 + (14 / 38) * lift) / (1 + stretch)));
    element.style.setProperty(names[2], String(1 - 0.91 * Math.min(1, Math.max(0, lift))));
  };
  const paint = () => {
    paintKnob();
    onPaint?.(state);
  };
  const deformation = createVelocityDeformation(maximum, (value) => {
    state.stretch = value;
    paint();
  });
  const lift = createSpring(0, stiffness, damping, (value) => {
    state.lift = value;
    paint();
  });
  paintKnob();
  const stop = () => {
    lift.stop();
    deformation.stop();
  };
  return {
    move(position, instant = false) {
      deformation.sample(position, instant);
      if (!instant) onPaint?.(state);
    },
    lift: (lifted, instant) => lift.set(lifted ? 1 : 0, instant),
    tune: (nextStiffness, nextDamping) => lift.tune(nextStiffness, nextDamping),
    stop,
    destroy() {
      stop();
      for (const name of names ?? []) element.style.removeProperty(name);
    },
  };
}
