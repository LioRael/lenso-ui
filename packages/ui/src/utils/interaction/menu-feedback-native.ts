// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
import {
  advanceSpring,
  prefersReducedMotion,
  type Spring,
  type SpringState,
} from "@lenso/glass/motion";

interface Track extends Omit<Spring, "set"> {
  set(values: number[], instant?: boolean): void;
  targets(): number[];
  active(): boolean;
}

/** Move the complete popup together; copied backdrops retain a coordinated JS path. */
export function createNativeMenuFeedback(card: HTMLElement) {
  if (
    typeof card.animate !== "function" ||
    !document.timeline ||
    document.timeline.currentTime === null ||
    card.ownerDocument !== document ||
    !CSS.supports("scale", "1") ||
    !CSS.supports("translate", "0px 0px") ||
    card.querySelector("[data-copy]")
  )
    return;
  const style = getComputedStyle(card);
  if (!["none", "1"].includes(style.scale) || !["none", "0px", "0px 0px"].includes(style.translate))
    return;
  const original = {
    scale: card.style.scale,
    translate: card.style.translate,
    "will-change": card.style.willChange,
  };
  const hint = [style.willChange === "auto" ? "" : style.willChange, "scale", "translate"]
    .filter(Boolean)
    .join(", ");
  const written = new Map<keyof typeof original, string>();
  const write = (property: keyof typeof original, value: string) => {
    if (card.style.getPropertyValue(property) !== value) card.style.setProperty(property, value);
    written.set(property, value);
  };
  const restore = (property: keyof typeof original) => {
    if (written.has(property) && card.style.getPropertyValue(property) === written.get(property))
      card.style.setProperty(property, original[property]);
  };
  let destroyed = false,
    native = true;
  const tracks: Track[] = [];
  const promotion = () => {
    if (destroyed) return;
    if (tracks.some((t) => t.active())) write("will-change", hint);
    else restore("will-change");
  };
  function track(
    property: "scale" | "translate",
    values: number[],
    stiffness: number,
    damping: number,
  ): Track {
    const states: SpringState[] = values.map((value) => ({
      value,
      target: value,
      velocity: 0,
      stiffness,
      damping,
    }));
    let started = performance.now(),
      animation: Animation | undefined,
      frame = 0;
    const text = (values: number[]) =>
      property === "scale" ? String(values[0]) : values[0] + "px " + values[1] + "px";
    const resting = (points: SpringState[]) =>
      points.every((s) => Math.abs(s.value - s.target) < 1e-4 && Math.abs(s.velocity) < 1e-3);
    const sample = () => {
      const time = performance.now();
      for (const s of states) advanceSpring(s, Math.max(0, (time - started) / 1000));
      started = time;
    };
    const stop = () => {
      animation?.cancel();
      animation = undefined;
      cancelAnimationFrame(frame);
      frame = 0;
      promotion();
    };
    const tick = () => {
      frame = 0;
      if (destroyed) return;
      sample();
      if (resting(states))
        for (const s of states) {
          s.value = s.target;
          s.velocity = 0;
        }
      write(property, text(states.map((s) => s.value)));
      if (!resting(states)) frame = requestAnimationFrame(tick);
    };
    const set = (values: number[], instant = false) => {
      if (destroyed) return;
      sample();
      states.forEach((s, i) => {
        s.target = values[i]!;
      });
      if (instant || document.hidden || prefersReducedMotion()) {
        for (const s of states) {
          s.value = s.target;
          s.velocity = 0;
        }
        stop();
        write(property, text(values));
        return;
      }
      if (!native) {
        stop();
        write(property, text(states.map((s) => s.value)));
        if (!resting(states)) frame = requestAnimationFrame(tick);
        return;
      }
      const frames: Keyframe[] = [],
        points = states.map((s) => ({ ...s }));
      let duration = 0;
      for (let step = 0; step <= 240; step++) {
        duration = (step * 1000) / 120;
        frames.push({ [property]: text(points.map((s) => s.value)) });
        if (resting(points)) break;
        for (const s of points) advanceSpring(s, 1 / 120);
      }
      frames[frames.length - 1] = { [property]: text(values) };
      write(property, text(values));
      if (!duration) {
        stop();
        return;
      }
      const next = card.animate(frames, { duration, easing: "linear", fill: "backwards" });
      // Default DocumentTimeline shares performance.now's origin, but its
      // frame-sampled currentTime can be stale after a long task.
      next.startTime = started;
      animation?.cancel();
      animation = next;
      promotion();
      next.onfinish = () => {
        if (animation !== next) return;
        animation = undefined;
        next.cancel();
        for (const s of states) {
          s.value = s.target;
          s.velocity = 0;
        }
        started = performance.now();
        promotion();
      };
    };
    const result = {
      set,
      tune(k: number, c: number) {
        sample();
        for (const s of states) {
          s.stiffness = k;
          s.damping = c;
        }
      },
      stop,
      paint() {
        if (animation) return;
        sample();
        write(property, text(states.map((s) => s.value)));
      },
      targets: () => states.map((s) => s.target),
      active: () => !!animation,
    };
    tracks.push(result);
    return result;
  }
  const scaleTrack = track("scale", [1], 650, 36),
    translate = track("translate", [0, 0], 600, 30);
  const scale: Spring = {
    ...scaleTrack,
    set(value, instant) {
      scaleTrack.set([value], instant);
    },
  };
  const axis = (index: number): Spring => ({
    ...translate,
    set(value, instant) {
      const next = translate.targets();
      next[index] = value;
      translate.set(next, instant);
    },
  });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finish = () => {
    if (document.hidden || reduced.matches) for (const t of tracks) t.set(t.targets(), true);
  };
  reduced.addEventListener("change", finish);
  document.addEventListener("visibilitychange", finish);
  const copies = new MutationObserver(() => {
    if (native && card.querySelector("[data-copy]")) {
      native = false;
      // A JS-positioned optical input cannot follow compositor-only motion
      // through a stall. Resume both from the same analytical pose.
      for (const t of tracks) t.set(t.targets());
    }
  });
  copies.observe(card, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-copy"],
  });
  return {
    scale,
    x: axis(0),
    y: axis(1),
    destroy() {
      destroyed = true;
      for (const t of tracks) t.stop();
      copies.disconnect();
      reduced.removeEventListener("change", finish);
      document.removeEventListener("visibilitychange", finish);
      for (const property of ["scale", "translate", "will-change"] as const) restore(property);
    },
  };
}
