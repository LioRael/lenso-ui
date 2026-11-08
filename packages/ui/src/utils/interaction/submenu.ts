import { useCallback, useLayoutEffect, useState, type Ref, type RefObject } from "react";
import { presentMenuFeedback } from "./menu-feedback.js";
import { afterMenuPlacement, retainMenuChild } from "./menu-placement.js";
import { presentCascadingSubmenu } from "./submenu-cascade.js";
import { assignRef } from "./ref.js";
import { createSpring } from "@lenso/glass/motion";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

// Siblings can overlap while returning. Only the last child restores the parent.
const parents = new WeakMap<HTMLElement, ReturnType<typeof createParentMotion>>();
function createParentMotion(surface: HTMLElement, content: HTMLElement) {
  const previous = {
    surfaceScale: surface.style.scale,
    contentScale: content.style.scale,
    opacity: content.style.opacity,
    pointer: content.style.pointerEvents,
    surfaceOrigin: surface.style.transformOrigin,
    contentOrigin: content.style.transformOrigin,
  };
  const children = new Map<object, number>();
  const paint = () => {
    const progress = Math.max(0, ...children.values());
    surface.style.scale = content.style.scale = String(1 - 0.04 * progress);
    content.style.opacity = String(1 - 0.55 * progress);
    content.style.pointerEvents = "none";
    surface.style.transformOrigin = content.style.transformOrigin = "top center";
  };
  return {
    retain() {
      const child = {};
      children.set(child, 0);
      paint();
      let active = true;
      return {
        paint(progress: number) {
          if (!active) return;
          children.set(child, progress);
          paint();
        },
        release() {
          if (!active) return;
          active = false;
          children.delete(child);
          if (children.size) return paint();
          surface.style.scale = previous.surfaceScale;
          content.style.scale = previous.contentScale;
          content.style.opacity = previous.opacity;
          content.style.pointerEvents = previous.pointer;
          surface.style.transformOrigin = previous.surfaceOrigin;
          content.style.transformOrigin = previous.contentOrigin;
          parents.delete(content);
        },
      };
    },
  };
}

function retainParentMotion(surface: HTMLElement, content: HTMLElement) {
  let motion = parents.get(content);
  if (!motion) {
    motion = createParentMotion(surface, content);
    parents.set(content, motion);
  }
  return motion.retain();
}

/** A shared item becomes the child panel's title; native Menu still owns focus. */
export function useSubmenuPopupRef(
  ref: Ref<HTMLDivElement>,
  trigger: RefObject<HTMLElement | null> | undefined,
  unmount: (() => void) | undefined,
  stacked: boolean,
) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const item = trigger?.current;
    const parent = item?.closest<HTMLElement>('[data-slot="menu-popup"]');
    if (!element || !item || !parent || !unmount) return;
    if (!stacked) return presentCascadingSubmenu(element, item, parent, unmount);
    let release = retainMenuChild(parent);
    let retained = true;
    const surface = element.querySelector<HTMLElement>('[data-slot="menu-surface"]')!;
    const heading = element.querySelector<HTMLElement>('[data-slot="menu-submenu-heading"]')!;
    const body = element.querySelector<HTMLElement>('[data-slot="menu-submenu-body"]')!;
    const parentSurface = parent.querySelector<HTMLElement>('[data-slot="menu-surface"]')!;
    const parentContent = parent.querySelector<HTMLElement>('[data-slot="menu-content"]')!;
    const previousItemOpacity = item.style.opacity;
    let parentMotion = retainParentMotion(parentSurface, parentContent);
    const content = heading.parentElement!;
    const titlePrevious = {
      opacity: heading.style.opacity,
      transform: heading.style.transform,
      origin: heading.style.transformOrigin,
      weight: heading.style.fontWeight,
      chevron: heading.style.getPropertyValue("--lg-submenu-chevron-rotation"),
      overflow: content.style.overflow,
    };
    const sourceWeight = parseFloat(getComputedStyle(item).fontWeight) || 400;
    const titleWeight = parseFloat(getComputedStyle(heading).fontWeight) || 600;
    heading.style.transformOrigin = "0 0";
    const disposeFeedback = presentMenuFeedback(element);
    surface.style.setProperty("--lg-menu-surface-opacity", "0");
    body.style.opacity = heading.style.opacity = "0";
    let spring: ReturnType<typeof createSpring> | undefined;
    let observer: MutationObserver | undefined;
    const cancelPlacement = afterMenuPlacement(element, () => {
      const popupBox = element.getBoundingClientRect();
      const titleBox = heading.getBoundingClientRect();
      const initialScaleX = popupBox.width / element.offsetWidth || 1;
      const initialScaleY = popupBox.height / element.offsetHeight || 1;
      const titleLayout = {
        x: (titleBox.x - popupBox.x) / initialScaleX,
        y: (titleBox.y - popupBox.y) / initialScaleY,
      };
      const target = surface.getBoundingClientRect();
      const positioner = element.parentElement!;
      const positioned = positioner.getBoundingClientRect();
      const width = surface.offsetWidth,
        height = surface.offsetHeight;
      surface.style.setProperty("--lg-map-radius", getComputedStyle(element).borderTopLeftRadius);
      let leaving = !element.hasAttribute("data-open");
      spring = createSpring(0, 600, 2 * Math.sqrt(600), (value) => {
        const t = clamp(value);
        parentMotion.paint(t);
        const from = item.getBoundingClientRect();
        const now = positioner.getBoundingClientRect();
        const dx = now.x - positioned.x,
          dy = now.y - positioned.y;
        surface.style.transform =
          t === 1
            ? ""
            : `translate(${(from.x - target.x - dx) * (1 - t)}px, ${(from.y - target.y - dy) * (1 - t)}px) scale(${(from.width + (width - from.width) * t) / width}, ${(from.height + (height - from.height) * t) / height})`;
        surface.style.setProperty("--lg-menu-surface-opacity", String(clamp(t / 0.2)));
        const popup = element.getBoundingClientRect();
        const scaleX = popup.width / element.offsetWidth || 1;
        const scaleY = popup.height / element.offsetHeight || 1;
        const titleX = popup.x + titleLayout.x * scaleX;
        const titleY = popup.y + titleLayout.y * scaleY;
        // Match the parent's current scale, not its row width: stretching the
        // entire row also stretches glyphs when child and parent widths differ.
        const fromScaleX = from.width / (item.offsetWidth * scaleX) || 1;
        const fromScaleY = from.height / (item.offsetHeight * scaleY) || 1;
        // Move the actual title to its own unscaled layout; no glyph swap at rest.
        heading.style.opacity = "1";
        const weightProgress = t * t * (3 - 2 * t);
        heading.style.fontWeight = String(
          Math.round(sourceWeight + (titleWeight - sourceWeight) * weightProgress),
        );
        heading.style.transform =
          t === 1
            ? titlePrevious.transform
            : `translate(${((from.x - titleX) * (1 - t)) / scaleX}px, ${((from.y - titleY) * (1 - t)) / scaleY}px) scale(${fromScaleX + (1 - fromScaleX) * t}, ${fromScaleY + (1 - fromScaleY) * t})`;
        heading.style.setProperty("--lg-submenu-chevron-rotation", `${90 * t}deg`);
        content.style.overflow = t === 1 ? titlePrevious.overflow : "visible";
        item.style.opacity = "0";
        body.style.opacity = String(clamp((t - 0.2) / 0.8));
        body.style.transform = t === 1 ? "" : `translateY(${8 * (1 - t)}px)`;
        if (leaving && value === 0) {
          item.style.opacity = previousItemOpacity;
          heading.style.opacity = "0";
          parentMotion.release();
          release();
          retained = false;
          unmount();
        }
      });
      spring.paint();
      const sync = () => {
        const closing = !element.hasAttribute("data-open") || !parent.hasAttribute("data-open");
        if (closing && element.hasAttribute("data-menu-child-count")) return;
        leaving = closing;
        if (!leaving) {
          if (!retained) {
            release = retainMenuChild(parent);
            parentMotion = retainParentMotion(parentSurface, parentContent);
            retained = true;
          }
          item.style.setProperty("opacity", "0");
        }
        const stiffness = leaving ? 900 : 600;
        spring!.tune(stiffness, 2 * Math.sqrt(stiffness));
        spring!.set(leaving ? 0 : 1);
      };
      observer = new MutationObserver(sync);
      observer.observe(element, {
        attributes: true,
        attributeFilter: ["data-open", "data-menu-child-count"],
      });
      observer.observe(parent, { attributes: true, attributeFilter: ["data-open"] });
      sync();
    });
    return () => {
      cancelPlacement();
      observer?.disconnect();
      spring?.stop();
      disposeFeedback();
      heading.style.opacity = titlePrevious.opacity;
      heading.style.transform = titlePrevious.transform;
      heading.style.transformOrigin = titlePrevious.origin;
      heading.style.fontWeight = titlePrevious.weight;
      if (titlePrevious.chevron)
        heading.style.setProperty("--lg-submenu-chevron-rotation", titlePrevious.chevron);
      else heading.style.removeProperty("--lg-submenu-chevron-rotation");
      content.style.overflow = titlePrevious.overflow;
      item.style.opacity = previousItemOpacity;
      parentMotion.release();
      release();
    };
  }, [element, trigger, unmount, stacked]);
  return useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
}
