// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted: Base UI owns open state, dismissal, focus, selection and unmount actions.
import { useCallback, useLayoutEffect, useState, type Ref, type RefObject } from "react";
import { createSpring } from "@lenso/glass/motion";
import { presentMenuFeedback } from "./menu-feedback.js";
import { afterMenuPlacement } from "./menu-placement.js";
import { assignRef } from "./ref.js";
import { sampleMenu, type MenuPose } from "./menu-shape.js";
import { createMenuTimeline } from "./menu-timeline.js";
import { iconMenuDurations, sampleIconMenu } from "./menu-icon-shape.js";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const writeStyle = (node: HTMLElement, name: string, value: string) => {
  if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
};
type PopupFamily = "menu" | "select";
// Two menus may share a toolbar while the previous menu is still closing.
const sourceMasks = new WeakMap<
  HTMLElement,
  { previousOpacity: string; previousTransform: string }
>();
const part = (card: HTMLElement, family: PopupFamily, name: string) =>
  card.querySelector<HTMLElement>(
    family === "select" && name === "list"
      ? "[data-select-content]"
      : `[data-slot="${family}-${name}"]`,
  );

function present(
  card: HTMLElement,
  trigger: HTMLElement,
  unmount: () => void,
  family: PopupFamily,
  morph = true,
) {
  const surface = part(card, family, "surface")!;
  const glyph = part(card, family, "glyph")!;
  const content = part(card, family, family === "select" ? "list" : "content")!;
  const plate = part(card, family, "plate");
  if (!surface || !glyph || !content) return;
  const updateGlyph = () => {
    glyph.replaceChildren(...[...trigger.childNodes].map((node) => node.cloneNode(true)));
    for (const child of glyph.querySelectorAll("[id], [tabindex]")) {
      child.removeAttribute("id");
      child.removeAttribute("tabindex");
    }
    for (const decoration of glyph.querySelectorAll(
      '[data-material-paint], [data-material-lens], [data-slot="glass-press-highlight"], [hidden]',
    ))
      decoration.remove();
  };
  if (morph) updateGlyph();
  // Fix the final lens dimensions once. Only the output shell morphs;
  // the live trigger can continue its independent press/release motion.
  const source = trigger.getBoundingClientRect();
  const target = card.getBoundingClientRect();
  const positioner = card.parentElement!;
  const positioned = positioner.getBoundingClientRect();
  const from = { width: source.width, height: source.height };
  const iconOnly =
    trigger.matches('[data-icon="only"]') ||
    (!trigger.textContent?.trim() && !!trigger.querySelector("svg"));
  const iconMenu =
    !morph ||
    (family === "menu" &&
      iconOnly &&
      Math.abs(source.width - source.height) <= 1 &&
      !trigger.querySelector('button, [role="button"]'));
  if (iconMenu) card.setAttribute("data-menu-motion", morph ? "icon" : "anchored");
  const to = { width: card.offsetWidth, height: card.offsetHeight };
  const start = { x: source.x - target.x, y: source.y - target.y };
  const radius = parseFloat(getComputedStyle(card).borderTopLeftRadius);
  const contentScale =
    parseFloat(getComputedStyle(card).getPropertyValue("--lg-menu-content-start-scale")) || 0.5;
  surface.style.setProperty("--lg-map-radius", `${radius}px`);
  const origin =
    family === "menu" || !morph
      ? { x: to.width / 2, y: to.height / 2 }
      : { x: start.x + from.width / 2, y: start.y + from.height / 2 };
  card.style.setProperty("--lg-menu-origin", `${origin.x}px ${origin.y}px`);
  content.style.transformOrigin = `${origin.x}px ${origin.y}px`;
  const mask = {
    previousOpacity: sourceMasks.get(trigger)?.previousOpacity ?? trigger.style.opacity,
    previousTransform: sourceMasks.get(trigger)?.previousTransform ?? trigger.style.transform,
  };
  if (morph) {
    sourceMasks.set(trigger, mask);
    trigger.style.opacity = "var(--lg-menu-trigger-opacity, 1)";
  }
  let glyphBox: DOMRect;
  const measureGlyph = () => {
    const triggerStyle = getComputedStyle(trigger);
    for (const name of [
      "font-family",
      "font-size",
      "font-weight",
      "font-style",
      "line-height",
      "display",
      "box-sizing",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width",
      "border-style",
      "align-items",
      "justify-content",
      "flex-direction",
      "column-gap",
      "row-gap",
      "white-space",
      "direction",
      "text-align",
    ])
      glyph.style.setProperty(name, triggerStyle.getPropertyValue(name));
    glyph.style.borderColor = "transparent";
    glyph.style.width = triggerStyle.width;
    glyph.style.height = triggerStyle.height;
    glyph.style.transformOrigin = "0 0";
    glyph.style.transform = "none";
    glyphBox = glyph.getBoundingClientRect();
    glyph.style.color = triggerStyle.color;
    glyph.style.letterSpacing = triggerStyle.letterSpacing;
  };
  if (morph) measureGlyph();
  let leaving = false;
  let returnScale = 1,
    returnLift = 0;
  const previousTransform = mask.previousTransform;
  const originalTransform =
    previousTransform ||
    (getComputedStyle(trigger).transform === "none" ? "" : getComputedStyle(trigger).transform);
  const measureAnchor = () => {
    const anchor = trigger.getBoundingClientRect();
    const positionedNow = positioner.getBoundingClientRect();
    if (!morph) {
      from.width = from.height = Math.min(44, anchor.width, anchor.height);
      start.x =
        anchor.x + (anchor.width - from.width) / 2 - target.x - (positionedNow.x - positioned.x);
      start.y =
        anchor.y + (anchor.height - from.height) / 2 - target.y - (positionedNow.y - positioned.y);
      return;
    }
    from.width = anchor.width / returnScale;
    from.height = anchor.height / (iconMenu ? returnScale : 1);
    start.x =
      anchor.x + (anchor.width - from.width) / 2 - target.x - (positionedNow.x - positioned.x);
    start.y =
      anchor.y +
      (anchor.height - from.height) / 2 -
      returnLift -
      target.y -
      (positionedNow.y - positioned.y);
  };
  const paintShape = (value: number, liquid?: MenuPose, finished = false) => {
    const t = clamp(value),
      settled = liquid ? finished && !leaving : t === 1;
    const width = Math.max(0.01, liquid?.width ?? from.width + (to.width - from.width) * t);
    const height = Math.max(0.01, liquid?.height ?? from.height + (to.height - from.height) * t);
    const scale = Math.max(0.01, liquid?.zoom ?? contentScale + (1 - contentScale) * t);
    const left = liquid?.left ?? start.x * (1 - t),
      top = liquid?.top ?? start.y * (1 - t);
    const shiftX = iconMenu ? left + width / 2 - origin.x : 0;
    const shiftY = iconMenu
      ? top + height / 2 - origin.y
      : family === "menu"
        ? (top + height / 2 - to.height / 2) * 0.45
        : 0;
    const local = (edge: number, centre: number, shift = 0) =>
      centre + (edge - centre - shift) / scale;
    surface.style.transform = settled
      ? ""
      : `translate(${left}px, ${top}px) scale(${width / to.width}, ${height / to.height})`;
    const corner = liquid?.corner ?? Math.min(radius, width / 2, height / 2);
    const rx = `${(corner * to.width) / width}px`,
      ry = `${(corner * to.height) / height}px`;
    surface.style.borderRadius = settled ? "" : `${rx} / ${ry}`;
    // Fade the lens itself: ancestor opacity cuts off Chromium backdrop input.
    writeStyle(surface, "--lg-menu-surface-opacity", String(liquid?.opacity ?? clamp(t / 0.2)));
    if (sourceMasks.get(trigger) === mask)
      writeStyle(
        trigger,
        "--lg-menu-trigger-opacity",
        String(
          liquid?.triggerOpacity ?? (family === "select" ? Number(t === 0) : 1 - clamp(t / 0.2)),
        ),
      );
    if (liquid && sourceMasks.get(trigger) === mask) {
      returnScale = Math.max(0.01, liquid.triggerScale);
      returnLift = liquid.triggerLift;
      if (returnScale !== 1 || returnLift !== 0)
        writeStyle(
          trigger,
          "transform",
          `${originalTransform} translateY(${returnLift}px) ${iconMenu ? "scale" : "scaleX"}(${returnScale})`,
        );
      else writeStyle(trigger, "transform", previousTransform);
    }
    const face = !morph
      ? 0
      : (liquid?.glyph ?? (family === "select" && t === 0 ? 0 : 1 - clamp(t / 0.45)));
    writeStyle(glyph, "opacity", String(face));
    // Return the unscaled selected label with its glass rather than above it.
    const glyphX = leaving ? left + (width - from.width) / 2 : start.x;
    const glyphY = leaving ? top + (height - from.height) / 2 : start.y;
    if (face > 0) {
      glyph.style.transform =
        family === "select" && leaving
          ? `translate(${glyphX}px, ${glyphY}px)`
          : `translate(${glyphX}px, ${glyphY}px) scale(${from.width / glyphBox.width}, ${from.height / glyphBox.height})`;
      writeStyle(glyph, "filter", `blur(${4 * (1 - face)}px)`);
    }
    const items = liquid?.items ?? (leaving ? clamp((t - 0.55) / 0.45) : clamp((t - 0.15) / 0.6));
    writeStyle(content, "opacity", String(items));
    content.style.transform = settled
      ? ""
      : family === "menu" || !morph
        ? `translate(${shiftX}px, ${shiftY}px) scale(${scale})`
        : `scale(${scale})`;
    writeStyle(
      content,
      "filter",
      settled || items <= 0 ? "" : `blur(${liquid?.blur ?? 6 * (1 - t)}px)`,
    );
    surface.toggleAttribute("data-material-resting", settled);
    content.style.clipPath = settled
      ? ""
      : `inset(${local(top, origin.y, shiftY)}px ${to.width - local(left + width, origin.x, shiftX)}px ${to.height - local(top + height, origin.y, shiftY)}px ${local(left, origin.x, shiftX)}px round ${corner / scale}px)`;
    card.toggleAttribute("data-menu-morphing", liquid ? !finished : !settled && value !== 0);
    if (leaving && (liquid ? finished : value === 0)) unmount();
  };
  const shape = createMenuTimeline(
    (time, open) => {
      measureAnchor();
      if (iconMenu) return sampleIconMenu(time, open, { ...from, ...start }, to, radius);
      return sampleMenu(
        time,
        open,
        { ...from, ...start },
        to,
        radius,
        iconOnly || family === "select",
      );
    },
    (pose, finished, open) => {
      leaving = !open;
      paintShape(pose.progress, pose, finished);
    },
    !morph || family === "select"
      ? { opening: iconMenuDurations.opening, closing: 299 }
      : iconMenu
        ? iconMenuDurations
        : undefined,
  );
  const motion = {
    ...shape,
    set(target: number, instant = false) {
      leaving = target === 0;
      shape.set(target, instant);
    },
  };
  let opened: boolean | undefined;
  const sync = () => {
    const next = card.hasAttribute("data-open") && !card.hasAttribute("data-ending-style");
    if (!next && card.hasAttribute("data-menu-child-count")) return;
    if (next !== opened) {
      opened = next;
      if (!next && family === "select" && morph) {
        updateGlyph();
        measureGlyph();
      }
      motion.set(next ? 1 : 0);
    }
  };
  const observer = new MutationObserver(sync);
  observer.observe(card, {
    attributes: true,
    attributeFilter: ["data-open", "data-closed", "data-ending-style", "data-menu-child-count"],
  });
  sync();

  const disposeFeedback = presentMenuFeedback(card, family);
  return () => {
    observer.disconnect();
    card.removeAttribute("data-menu-plate-active");
    card.removeAttribute("data-menu-motion");
    shape.stop();
    surface.removeAttribute("data-material-resting");
    if (sourceMasks.get(trigger) === mask) {
      sourceMasks.delete(trigger);
      trigger.style.removeProperty("--lg-menu-trigger-opacity");
      trigger.style.opacity = mask.previousOpacity;
      trigger.style.transform = previousTransform;
    }
    glyph.replaceChildren();
    glyph.removeAttribute("style");
    card.style.removeProperty("--lg-menu-origin");
    surface.style.removeProperty("--lg-map-radius");
    surface.style.removeProperty("--lg-menu-surface-opacity");
    for (const name of ["width", "height", "opacity", "transform", "border-radius"])
      surface.style.removeProperty(name);
    for (const name of ["transform-origin", "opacity", "transform", "filter", "clip-path"])
      content.style.removeProperty(name);
    card.removeAttribute("data-scrubbing");
    card.removeAttribute("data-pressed");
    if (plate) plate.style.opacity = "0";
    disposeFeedback();
  };
}

function presentAnchored(card: HTMLElement, unmount: () => void, family: PopupFamily) {
  const surface = part(card, family, "surface")!;
  const content = part(card, family, family === "select" ? "list" : "content")!;
  const origin = getComputedStyle(card).getPropertyValue("--transform-origin") || "center";
  surface.style.transformOrigin = origin;
  content.style.transformOrigin = origin;
  let leaving = false;
  const spring = createSpring(0, 600, 46, (value) => {
    if (leaving && card.hasAttribute("data-context-preview-motion")) {
      surface.style.transform = "";
      content.style.transform = "";
      content.style.filter = "";
      if (value === 0) unmount();
      return;
    }
    const t = clamp(value);
    const transform = t === 1 ? "" : `scale(${0.5 + 0.5 * t})`;
    surface.style.transform = transform;
    surface.style.setProperty("--lg-menu-surface-opacity", String(clamp(t / 0.2)));
    content.style.transform = transform;
    content.style.opacity = String(leaving ? clamp((t - 0.55) / 0.45) : clamp((t - 0.15) / 0.6));
    content.style.filter = t === 1 ? "" : `blur(${6 * (1 - t)}px)`;
    surface.toggleAttribute("data-material-resting", t === 1);
    card.toggleAttribute("data-menu-morphing", t !== 1 && value !== 0);
    if (leaving && value === 0) unmount();
  });
  spring.paint();
  let opened: boolean | undefined;
  const sync = () => {
    const next = card.hasAttribute("data-open") && !card.hasAttribute("data-ending-style");
    if (!next && card.hasAttribute("data-menu-child-count")) return;
    if (opened === next) return;
    opened = next;
    leaving = !next;
    spring.tune(leaving ? 900 : 600, leaving ? 57 : 46);
    spring.set(next ? 1 : 0);
  };
  const observer = new MutationObserver(sync);
  observer.observe(card, {
    attributes: true,
    attributeFilter: ["data-open", "data-closed", "data-ending-style", "data-menu-child-count"],
  });
  const stopFeedback = presentMenuFeedback(card, family);
  sync();
  return () => {
    observer.disconnect();
    spring.stop();
    stopFeedback();
    surface.style.removeProperty("--lg-menu-surface-opacity");
    for (const node of [surface, content])
      for (const property of ["transform", "transform-origin", "opacity", "filter"])
        node.style.removeProperty(property);
    card.removeAttribute("data-menu-morphing");
    surface.removeAttribute("data-material-resting");
  };
}

export function useMenuPopupRef(
  ref: Ref<HTMLDivElement> | undefined,
  popup: RefObject<HTMLElement | null>,
  trigger: RefObject<HTMLElement | null>,
  unmount: () => void,
  morph: boolean,
  feedback = false,
  family: PopupFamily = "menu",
) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (!element) return;
    if (!morph && !feedback) return;
    const labelledBy = element.getAttribute("aria-labelledby")?.split(" ")[0];
    const owner =
      trigger.current ?? (labelledBy ? element.ownerDocument.getElementById(labelledBy) : null);
    if (morph && !owner) return;
    let cleanup: (() => void) | undefined;
    let cancelPlacement = () => {};
    const start = () => {
      cancelPlacement();
      cleanup?.();
      const content = part(element, family, family === "select" ? "list" : "content");
      const surface = part(element, family, "surface");
      if (content) content.style.opacity = "0";
      if (surface) surface.style.setProperty("--lg-menu-surface-opacity", "0");
      cancelPlacement = afterMenuPlacement(element, () => {
        cleanup = owner
          ? present(element, owner, unmount, family, morph)
          : presentAnchored(element, unmount, family);
      });
    };
    // Select retains closed items for label resolution; remeasure each opening.
    let opened = element.hasAttribute("data-open");
    if (family === "menu" || opened) start();
    const reopen =
      family === "select"
        ? new MutationObserver(() => {
            const next = element.hasAttribute("data-open");
            if (next && !opened) start();
            opened = next;
          })
        : null;
    reopen?.observe(element, { attributes: true, attributeFilter: ["data-open", "data-closed"] });
    return () => {
      reopen?.disconnect();
      cancelPlacement();
      cleanup?.();
    };
  }, [element, trigger, unmount, morph, feedback, family]);
  return useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      const own = assignRef(popup, node),
        caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [popup, ref],
  );
}
