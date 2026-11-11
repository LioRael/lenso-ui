// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Glisse 0.5.0 optical profiles, attached to Lenso's existing control motion.
import { createControlLens, type ControlLens, type ControlLensOptions } from "@lenso/glass";
import { knobMaterialStyles } from "@lenso/tokens/materials";
import * as stylex from "@stylexjs/stylex";

const profiles = {
  segment: { strength: 0.3, dispersion: 0.1, depth: 2.5, dome: 0, splay: 1, ink: true },
  switch: { strength: 0.45, dispersion: 1, depth: 2, dome: 6, splay: 0.4 },
  slider: { strength: 0.75, dispersion: 0.65, depth: 2, dome: 5, splay: 0.5 },
} satisfies Record<string, ControlLensOptions>;

export function createLabelRefraction(element: HTMLElement) {
  return createControlLens(element, element, {
    ...profiles.segment,
    paintsLight: true,
    pill: true,
  });
}

interface TrackSurface {
  content: HTMLElement;
  paint(amount: number): void;
  refresh(): void;
  setActive(active: boolean): void;
  lenses: Map<ControlLens, number>;
  dispose(): void;
}
const tracks = new WeakMap<HTMLElement, TrackSurface>();

/** The source remains native; only the track seen through a held knob is replaced. */
export function createKnobRefraction(
  control: HTMLElement,
  glass: HTMLElement,
  kind: "switch" | "slider",
) {
  const source = control.querySelector<HTMLElement>(`[data-slot="${kind}-track"]`);
  if (!source) return;
  const sourcePaint =
    source.querySelector<HTMLElement>('[data-slot="slider-track-paint"]') ?? source;
  const sourceFill = source.querySelector<HTMLElement>('[data-slot="slider-fill"]');
  let shared = tracks.get(source);
  if (!shared) {
    const content = document.createElement("span");
    content.className = stylex.props(knobMaterialStyles.content).className ?? "";
    content.dataset["controlLensContent"] = kind;
    content.setAttribute("aria-hidden", "true");
    content.inert = true;
    const track = document.createElement("span");
    const fill = document.createElement("span");
    if (kind === "slider") track.append(fill);
    content.append(track);
    control.prepend(content);
    const lenses = new Map<ControlLens, number>();
    let x = 0,
      y = 0,
      width = 0,
      height = 0;
    let signature = "";
    const background = kind === "switch" ? control : source;
    const backgroundProperties = [
      "background-color",
      "background-image",
      "background-size",
      "background-position",
      "background-repeat",
    ];
    let saved: [string, string, string][] | undefined;
    // Mask only the paint, never a track's nested native thumbs or inputs.
    const setActive = (active: boolean) => {
      if (active === Boolean(saved)) return;
      if (active) {
        const style = getComputedStyle(background);
        const paint = backgroundProperties.map(
          (name) => [name, style.getPropertyValue(name)] as const,
        );
        saved = backgroundProperties.map((name) => [
          name,
          background.style.getPropertyValue(name),
          background.style.getPropertyPriority(name),
        ]);
        for (const [name, value] of paint) sourcePaint.style.setProperty(name, value);
        background.style.backgroundColor = "transparent";
        background.style.backgroundImage = "none";
      } else {
        for (const [name, value, priority] of saved!) {
          if (value) background.style.setProperty(name, value, priority);
          else background.style.removeProperty(name);
          sourcePaint.style.removeProperty(name);
        }
        saved = undefined;
      }
      syncPaint();
    };
    const paint = (amount: number) => {
      const vertical = source.getAttribute("data-orientation") === "vertical";
      const cross = (8 / 6) * (0.6 + 0.4 * amount);
      const w = kind === "switch" ? width * (0.85 + 0.1 * amount) : width * (vertical ? cross : 1);
      const h =
        kind === "switch"
          ? height * 0.75 * (0.525 + 0.45 * amount)
          : height * (vertical ? 1 : cross);
      Object.assign(track.style, {
        position: "absolute",
        inset: `${24 + y + (height - h) / 2}px auto auto ${24 + x + (width - w) / 2}px`,
        transform: "none",
        margin: "0",
        maxWidth: "none",
        width: `${w}px`,
        height: `${h}px`,
        borderRadius: "999px",
      });
    };
    const syncPaint = () => {
      const copyStyle = (element: HTMLElement) =>
        Array.from(element.style)
          .filter((name) => !name.startsWith("mask") && !name.startsWith("-webkit-mask"))
          .map(
            (name) =>
              `${name}:${element.style.getPropertyValue(name)}${element.style.getPropertyPriority(name) ? " !important" : ""};`,
          )
          .join("");
      const sourceStyle = copyStyle(sourcePaint);
      const fillStyle = sourceFill ? copyStyle(sourceFill) : "";
      const next = [sourcePaint.className, sourceStyle, sourceFill?.className, fillStyle].join("|");
      if (next === signature) return;
      signature = next;
      track.className = sourcePaint.className;
      track.style.cssText = sourceStyle;
      if (sourceFill) {
        fill.className = sourceFill.className;
        fill.style.cssText = fillStyle;
        fill.style.display = "block";
      }
      paint(Math.max(0, ...lenses.values()));
    };
    const refresh = () => {
      x = source.offsetLeft;
      y = source.offsetTop;
      width = source.offsetWidth;
      height = source.offsetHeight;
      syncPaint();
      paint(Math.max(0, ...lenses.values()));
    };
    const changes = new MutationObserver(syncPaint);
    changes.observe(source, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    const resize = new ResizeObserver(() => {
      refresh();
      for (const lens of lenses.keys()) lens.refit();
    });
    resize.observe(source);
    resize.observe(control);
    refresh();
    shared = {
      content,
      paint,
      refresh,
      lenses,
      setActive,
      dispose() {
        setActive(false);
        changes.disconnect();
        resize.disconnect();
        content.remove();
        tracks.delete(source);
      },
    };
    tracks.set(source, shared);
  }
  const surface = shared;
  const lens = createControlLens(
    glass,
    surface.content,
    { ...profiles[kind], paintsLight: true, pill: true },
    [sourcePaint, ...(sourceFill ? [sourceFill] : [])],
  );
  surface.lenses.set(lens, 0);
  let active = false;
  return {
    update(amount: number) {
      const next = amount > 0.01;
      surface.lenses.set(lens, Math.min(1, Math.max(0, amount)));
      surface.setActive([...surface.lenses.values()].some((value) => value > 0.01));
      if (next && !active) surface.refresh();
      active = next;
      surface.paint(Math.max(0, ...surface.lenses.values()));
      lens.setActive(next);
      lens.update(amount);
    },
    destroy() {
      lens.destroy();
      surface.lenses.delete(lens);
      surface.setActive([...surface.lenses.values()].some((value) => value > 0.01));
      if (!surface.lenses.size) surface.dispose();
    },
  };
}
