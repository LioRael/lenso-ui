import { useCallback, useLayoutEffect, useState, type Ref, type RefObject } from "react";
import { presentMenuFeedback } from "./menu-feedback.js";
import { afterMenuPlacement, retainMenuChild } from "./menu-placement.js";
import { presentCascadingSubmenu } from "./submenu-cascade.js";
import { assignRef } from "./ref.js";
import { createSpring } from "@lenso/glass/motion";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

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
    const previous = [
      parentSurface.style.scale,
      parentContent.style.scale,
      parentContent.style.opacity,
      item.style.opacity,
      parentContent.style.pointerEvents,
    ];
    parentContent.style.pointerEvents = "none";
    const sourceStyle = getComputedStyle(item);
    const titleStyle = getComputedStyle(heading);
    const sourceWeight = Number(sourceStyle.fontWeight) || 400;
    const titleWeight = Number(titleStyle.fontWeight) || 600;
    const ghost = document.createElement("div");
    ghost.setAttribute("data-slot", "menu-submenu-glyph");
    ghost.setAttribute("aria-hidden", "true");
    ghost.inert = true;
    ghost.className = item.className;
    ghost.replaceChildren(...[...item.childNodes].map((node) => node.cloneNode(true)));
    for (const child of ghost.querySelectorAll("[id], [tabindex]")) {
      child.removeAttribute("id");
      child.removeAttribute("tabindex");
    }
    for (const name of [
      "font-family",
      "font-size",
      "font-style",
      "line-height",
      "letter-spacing",
      "color",
      "display",
      "box-sizing",
      "padding-top",
      "padding-right",
      "padding-bottom",
      "padding-left",
      "align-items",
      "justify-content",
      "flex-direction",
      "column-gap",
      "row-gap",
      "white-space",
      "direction",
      "text-align",
    ])
      ghost.style.setProperty(name, sourceStyle.getPropertyValue(name));
    Object.assign(ghost.style, {
      position: "absolute",
      left: "0",
      top: "0",
      width: `${item.offsetWidth}px`,
      height: `${item.offsetHeight}px`,
      pointerEvents: "none",
      isolation: "isolate",
      mixBlendMode: "normal",
      transformOrigin: "0 0",
      backgroundColor: "transparent",
      opacity: "0",
      zIndex: "2",
    });
    element.append(ghost);
    const disposeFeedback = presentMenuFeedback(element);
    const oldOrigins = [parentSurface.style.transformOrigin, parentContent.style.transformOrigin];
    const restoreParent = () => {
      parentSurface.style.scale = previous[0]!;
      parentContent.style.scale = previous[1]!;
      parentContent.style.opacity = previous[2]!;
      item.style.setProperty("opacity", previous[3]!);
      parentContent.style.pointerEvents = previous[4]!;
      parentSurface.style.transformOrigin = oldOrigins[0]!;
      parentContent.style.transformOrigin = oldOrigins[1]!;
    };
    parentSurface.style.transformOrigin = parentContent.style.transformOrigin = "top center";
    surface.style.setProperty("--lg-menu-surface-opacity", "0");
    body.style.opacity = heading.style.opacity = "0";
    let spring: ReturnType<typeof createSpring> | undefined;
    let observer: MutationObserver | undefined;
    const cancelPlacement = afterMenuPlacement(element, () => {
      const target = surface.getBoundingClientRect();
      const positioner = element.parentElement!;
      const positioned = positioner.getBoundingClientRect();
      const width = surface.offsetWidth,
        height = surface.offsetHeight;
      surface.style.setProperty("--lg-map-radius", getComputedStyle(element).borderTopLeftRadius);
      let leaving = !element.hasAttribute("data-open");
      spring = createSpring(0, 600, 46, (value) => {
        const t = clamp(value);
        parentSurface.style.scale = parentContent.style.scale = String(1 - 0.04 * t);
        parentContent.style.opacity = String(1 - 0.55 * t);
        const from = item.getBoundingClientRect();
        const now = positioner.getBoundingClientRect();
        const dx = now.x - positioned.x,
          dy = now.y - positioned.y;
        surface.style.transform =
          t === 1
            ? ""
            : `translate(${(from.x - target.x - dx) * (1 - t)}px, ${(from.y - target.y - dy) * (1 - t)}px) scale(${(from.width + (width - from.width) * t) / width}, ${(from.height + (height - from.height) * t) / height})`;
        surface.style.setProperty("--lg-menu-surface-opacity", String(clamp(t / 0.2)));
        const title = heading.getBoundingClientRect();
        const popup = element.getBoundingClientRect();
        const settled = value === 1;
        // One visual row owns the whole trip. Only hand back at an exact endpoint.
        heading.style.opacity = settled ? "1" : "0";
        item.style.opacity = "0";
        ghost.style.opacity = settled ? "0" : "1";
        ghost.style.fontWeight = String(sourceWeight + (titleWeight - sourceWeight) * t);
        ghost.style.setProperty("--lg-submenu-chevron-rotation", `${90 * t}deg`);
        ghost.style.transform = `translate(${from.x + (title.x - from.x) * t - popup.x}px, ${from.y + (title.y - from.y) * t - popup.y}px) scale(${(from.width + (title.width - from.width) * t) / item.offsetWidth}, ${(from.height + (title.height - from.height) * t) / item.offsetHeight})`;
        body.style.opacity = String(clamp((t - 0.2) / 0.8));
        body.style.transform = t === 1 ? "" : `translateY(${8 * (1 - t)}px)`;
        if (leaving && value === 0) {
          item.style.setProperty("opacity", previous[3]!);
          ghost.style.opacity = "0";
          restoreParent();
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
            retained = true;
          }
          parentContent.style.pointerEvents = "none";
          parentSurface.style.transformOrigin = parentContent.style.transformOrigin = "top center";
          item.style.setProperty("opacity", "0");
        }
        spring!.tune(leaving ? 900 : 600, leaving ? 57 : 46);
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
      ghost.remove();
      restoreParent();
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
