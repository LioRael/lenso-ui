// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Original spring integration and constants retained for motion fidelity.
import { advanceSpring, type SpringState } from "./spring-state.js";

export interface Spring {
  paint(): void;
  set(target: number, instant?: boolean): void;
  tune(stiffness: number, damping: number): void;
  stop(): void;
}

interface State extends SpringState {
  paint: (value: number) => void;
}

const moving = new Set<State>();
let frame = 0;
let last = 0;
let ticking = false;

function rest(s: State): void {
  moving.delete(s);
  if (moving.size || ticking || !frame) return;
  cancelAnimationFrame(frame);
  frame = 0;
}

function tick(time: number): void {
  ticking = true;
  // Keep the frame owned while callbacks retarget other springs. Clearing it
  // here lets nested set() calls start duplicate animation-frame chains.
  const dt = Math.min(0.1, Math.max(0, (time - last) / 1000));
  last = time;
  for (const s of moving) {
    advanceSpring(s, dt);
    if (Math.abs(s.value - s.target) < 1e-4 && Math.abs(s.velocity) < 1e-3) {
      s.value = s.target;
      s.velocity = 0;
      moving.delete(s);
    }
    s.paint(s.value);
  }
  ticking = false;
  frame = moving.size ? requestAnimationFrame(tick) : 0;
}

export function prefersReducedMotion(): boolean {
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createSpring(
  value: number,
  stiffness: number,
  damping: number,
  paint: (value: number) => void,
): Spring {
  const s: State = { value, target: value, velocity: 0, stiffness, damping, paint };
  return {
    paint: () => paint(s.value),
    set(target, instant = false) {
      s.target = target;
      if (instant || document.hidden || prefersReducedMotion()) {
        s.value = target;
        s.velocity = 0;
        rest(s);
        paint(target);
        return;
      }
      moving.add(s);
      if (!frame) {
        // Measure from the start of the current frame, so the next one
        // already shows a frame's worth of motion.
        last = Number(document.timeline?.currentTime ?? performance.now());
        frame = requestAnimationFrame(tick);
      }
    },
    tune(nextStiffness, nextDamping) {
      s.stiffness = nextStiffness;
      s.damping = nextDamping;
    },
    stop: () => rest(s),
  };
}
