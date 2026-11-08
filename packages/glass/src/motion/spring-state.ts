// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
export interface SpringState {
  value: number;
  target: number;
  velocity: number;
  stiffness: number;
  damping: number;
}

/** Advance an analytical spring in seconds, without scheduling or painting. */
export function advanceSpring(s: SpringState, dt: number): void {
  const x = s.value - s.target;
  const v = s.velocity;
  const half = s.damping / 2;
  const discriminant = half * half - s.stiffness;
  if (Math.abs(discriminant) < 1e-4) {
    const decay = Math.exp(-half * dt);
    const b = v + half * x;
    s.value = s.target + decay * (x + b * dt);
    s.velocity = decay * (v - half * b * dt);
  } else if (discriminant > 0) {
    const root = Math.sqrt(discriminant);
    const r1 = -half + root;
    const r2 = -half - root;
    const a = (v - r2 * x) / (r1 - r2);
    const b = x - a;
    s.value = s.target + a * Math.exp(r1 * dt) + b * Math.exp(r2 * dt);
    s.velocity = a * r1 * Math.exp(r1 * dt) + b * r2 * Math.exp(r2 * dt);
  } else {
    const omega = Math.sqrt(-discriminant);
    const decay = Math.exp(-half * dt);
    const cos = Math.cos(omega * dt);
    const sin = Math.sin(omega * dt);
    s.value = s.target + decay * (x * cos + ((v + half * x) / omega) * sin);
    s.velocity = decay * (v * cos - ((half * v + s.stiffness * x) / omega) * sin);
  }
}
