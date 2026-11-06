// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted: Base UI owns open state, dismissal, focus, selection and unmount actions.
import { useCallback, useLayoutEffect, useState, type Ref, type RefObject } from "react";
import { createSpring, type Spring } from "@lenso/glass/motion";
import { presentMenuFeedback } from "./menu-feedback.js";
import { afterMenuPlacement } from "./menu-placement.js";
import { assignRef } from "./ref.js";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
type PopupFamily = "menu" | "select";
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
      "[data-material-paint], [data-material-lens], [hidden]",
    ))
      decoration.remove();
  };
  updateGlyph();
  // Fix the final lens dimensions once. Only the output shell morphs;
  // the live trigger can continue its independent press/release motion.
  const source = trigger.getBoundingClientRect();
  const target = card.getBoundingClientRect();
  const positioner = card.parentElement!;
  const positioned = positioner.getBoundingClientRect();
  const from = { width: source.width, height: source.height };
  const to = { width: card.offsetWidth, height: card.offsetHeight };
  const start = { x: source.x - target.x, y: source.y - target.y };
  const radius = parseFloat(getComputedStyle(card).borderTopLeftRadius);
  const contentScale =
    parseFloat(getComputedStyle(card).getPropertyValue("--lg-menu-content-start-scale")) || 0.5;
  surface.style.setProperty("--lg-map-radius", `${radius}px`);
  const origin = { x: start.x + from.width / 2, y: start.y + from.height / 2 };
  card.style.setProperty("--lg-menu-origin", `${origin.x}px ${origin.y}px`);
  content.style.transformOrigin = `${origin.x}px ${origin.y}px`;
  const previousOpacity = trigger.style.opacity;
  trigger.style.opacity = "var(--lg-menu-trigger-opacity, 1)";
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
    glyphBox = glyph.getBoundingClientRect();
    glyph.style.color = triggerStyle.color;
    glyph.style.letterSpacing = triggerStyle.letterSpacing;
  };
  measureGlyph();
  let leaving = false;
  const shape = createSpring(0, 600, 46, (value) => {
    const t = clamp(value),
      settled = t === 1;
    // Press springs and native anchoring can move after the popup mounts.
    // Reconcile the live anchor before writing this frame; keep lens sizes fixed.
    const anchor = trigger.getBoundingClientRect();
    const positionedNow = positioner.getBoundingClientRect();
    from.width = anchor.width;
    from.height = anchor.height;
    start.x = anchor.x - target.x - (positionedNow.x - positioned.x);
    start.y = anchor.y - target.y - (positionedNow.y - positioned.y);
    const width = from.width + (to.width - from.width) * t;
    const height = from.height + (to.height - from.height) * t;
    const scale = contentScale + (1 - contentScale) * t;
    const left = start.x * (1 - t),
      top = start.y * (1 - t);
    const local = (edge: number, centre: number) => centre + (edge - centre) / scale;
    surface.style.transform = settled
      ? ""
      : `translate(${left}px, ${top}px) scale(${width / to.width}, ${height / to.height})`;
    const corner = Math.min(radius, width / 2, height / 2);
    surface.style.borderRadius = settled
      ? ""
      : `${(corner * to.width) / width}px / ${(corner * to.height) / height}px`;
    // Fade the lens itself: ancestor opacity cuts off Chromium backdrop input.
    surface.style.setProperty("--lg-menu-surface-opacity", String(clamp(t / 0.2)));
    trigger.style.setProperty(
      "--lg-menu-trigger-opacity",
      String(family === "select" ? Number(t === 0) : 1 - clamp(t / 0.2)),
    );
    glyph.style.opacity = String(family === "select" && t === 0 ? 0 : 1 - clamp(t / 0.45));
    const drift = 0.3 * t;
    // The selected label may change width. Return one unscaled copy to the live trigger.
    glyph.style.transform =
      family === "select" && leaving
        ? `translate(${start.x}px, ${start.y}px)`
        : `translate(${start.x + (left + width / 2 - origin.x) * drift - from.width * drift}px, ${start.y + (top + height / 2 - origin.y) * drift - from.height * drift}px) scale(${(from.width / glyphBox.width) * (1 + 0.6 * t)}, ${(from.height / glyphBox.height) * (1 + 0.6 * t)})`;
    glyph.style.filter = family === "select" && leaving ? "" : `blur(${8 * t}px)`;
    content.style.opacity = String(leaving ? clamp((t - 0.55) / 0.45) : clamp((t - 0.15) / 0.6));
    content.style.transform = settled ? "" : `scale(${scale})`;
    content.style.filter = settled ? "" : `blur(${6 * (1 - t)}px)`;
    content.style.clipPath = settled
      ? ""
      : `inset(${local(top, origin.y)}px ${to.width - local(left + width, origin.x)}px ${to.height - local(top + height, origin.y)}px ${local(left, origin.x)}px round ${radius / scale}px)`;
    card.toggleAttribute("data-menu-morphing", !settled && value !== 0);
    if (leaving && value === 0) unmount();
  });
  const morph: Spring = {
    ...shape,
    set(target, instant) {
      leaving = target === 0;
      shape.tune(leaving ? 900 : 600, leaving ? 57 : 46);
      shape.set(target, instant);
    },
  };
  shape.paint();
  let opened: boolean | undefined;
  const sync = () => {
    const next = card.hasAttribute("data-open") && !card.hasAttribute("data-ending-style");
    if (!next && card.hasAttribute("data-menu-child-count")) return;
    if (next !== opened) {
      opened = next;
      if (!next && family === "select") {
        updateGlyph();
        measureGlyph();
      }
      morph.set(next ? 1 : 0);
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
    shape.stop();
    trigger.style.removeProperty("--lg-menu-trigger-opacity");
    trigger.style.opacity = previousOpacity;
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
  };
}

export function useMenuPopupRef(
  ref: Ref<HTMLDivElement> | undefined,
  popup: RefObject<HTMLElement | null>,
  trigger: RefObject<HTMLElement | null>,
  unmount: () => void,
  morph: boolean | "aligned",
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
    if (morph === true && !owner) return;
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
        const overlap = morph === "aligned" ? element.getAttribute("data-side") === "none" : morph;
        cleanup =
          overlap && owner
            ? present(element, owner, unmount, family)
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
