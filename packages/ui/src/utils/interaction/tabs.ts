// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted: springs decorate native Base UI selection; Base UI retains keyboard and focus ownership.
import { useCallback, useEffect, useState, type Ref } from "react";
import * as stylex from "@stylexjs/stylex";
import { tabsStyles } from "@lenso/tokens/tabs";
import { held } from "./hold.js";
import {
  createSpring,
  prefersReducedMotion,
  deformationSpring,
  velocityDeformation,
} from "@lenso/glass/motion";
import { assignRef } from "./ref.js";
import { createLabelRefraction } from "../materials/control-lens.js";
import type { SegmentedPresentationKind } from "../segmented-presentation.js";

interface Parts {
  kind: SegmentedPresentationKind;
  bar: HTMLElement;
  glass: HTMLElement;
  lens: HTMLElement;
  tint: HTMLElement;
  row: HTMLElement;
  centreRow: HTMLElement;
  ring: HTMLElement;
  centre: HTMLElement;
  optics: HTMLElement;
}

interface Controller {
  setActive(index: number): void;
  destroy(): void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const REST = [1024, 58.9, 676, 47.8] as const;
const DRAG = [2500, 94, 576, 44.2] as const;
let nextCopyId = 0;

function copyTab(tab: HTMLElement, className: string) {
  const copy = document.createElement("span");
  copy.className = className;
  for (const node of tab.childNodes) copy.append(node.cloneNode(true));
  for (const separator of copy.querySelectorAll("[data-slot='tabs-separator']")) separator.remove();
  const nodes = [...copy.querySelectorAll<HTMLElement | SVGElement>("*")];
  const ids = new Map<string, string>();
  const prefix = `lenso-tabs-copy-${++nextCopyId}-`;
  for (const node of nodes) {
    const id = node.getAttribute("id");
    if (id) {
      const replacement = `${prefix}${ids.size}`;
      ids.set(id, replacement);
      node.setAttribute("id", replacement);
    }
    for (const attribute of ["tabindex", "data-testid", "autofocus"])
      node.removeAttribute(attribute);
    if (node.matches("input, select, textarea, button")) {
      node.removeAttribute("name");
      node.removeAttribute("form");
    }
  }
  for (const node of nodes) {
    for (const attribute of [...node.attributes]) {
      let value = attribute.value.replace(
        /url\(\s*(['"]?)#([^)'"\s]+)\1\s*\)/g,
        (whole, quote: string, id: string) =>
          ids.has(id) ? `url(${quote}#${ids.get(id)}${quote})` : whole,
      );
      if ((attribute.name === "href" || attribute.name === "xlink:href") && value.startsWith("#"))
        value = ids.has(value.slice(1)) ? `#${ids.get(value.slice(1))}` : value;
      if (attribute.name === "for" && ids.has(value)) value = ids.get(value)!;
      if (attribute.name === "aria-labelledby" || attribute.name === "aria-describedby")
        value = value
          .split(/\s+/)
          .map((id) => ids.get(id) ?? id)
          .join(" ");
      attribute.value = value;
    }
  }
  return copy;
}

function attach({
  kind,
  bar,
  glass,
  lens,
  tint,
  row,
  centreRow,
  ring,
  centre,
  optics,
}: Parts): Controller {
  const itemSelector =
    kind === "tabs"
      ? "[data-slot='tabs-tab']:not([data-tabs-overflow])"
      : "[data-slot='segmented-control-item']";
  const selectedAttribute = kind === "tabs" ? "aria-selected" : "aria-checked";
  const tabs = [...bar.querySelectorAll<HTMLElement>(itemSelector)];
  const vertical = bar.getAttribute("data-orientation") === "vertical";
  const ringClipSupported = CSS.supports("clip-path", 'path(evenodd, "M 0 0 H 1 V 1 H 0 Z")');
  const coordinate = (event: PointerEvent) => (vertical ? event.clientY : event.clientX);
  let slot = 0;
  let width = 0;
  let padding = 2;
  let height = 0;
  let originX = 0;
  let originY = 0;
  let direction = 1;
  let restInset = 0;
  let growX = 16;
  let growY = 12;
  let active = -1;
  let shown = false;
  let settleFrame = 0;
  let gesture: {
    id: number;
    x: number;
    anchor: number;
    moved: boolean;
    box: DOMRect;
    at: number;
  } | null = null;
  const state = { x: 0, lift: 0, stretch: 0 };
  let lastPosition = 0;
  let lastTime = 0;
  const refraction = createLabelRefraction(optics);

  const measure = () => {
    const style = getComputedStyle(bar);
    direction = !vertical && style.direction === "rtl" ? -1 : 1;
    padding = parseFloat(style.paddingLeft) || 0;
    const box = bar.getBoundingClientRect();
    const scaleX = box.width / bar.offsetWidth || 1;
    const scaleY = box.height / bar.offsetHeight || 1;
    const gap = style.gap;
    const typography = [
      "font-family",
      "font-size",
      "font-weight",
      "font-style",
      "line-height",
      "letter-spacing",
      "text-transform",
      "text-align",
      "white-space",
      "align-items",
      "justify-content",
      "flex-direction",
      "gap",
      "padding",
      "border-width",
      "border-style",
    ];
    const metrics = tabs.map((tab) => {
      const tabStyle = getComputedStyle(tab);
      const rect = tab.getBoundingClientRect();
      return {
        width: rect.width / scaleX || tab.offsetWidth,
        height: rect.height / scaleY || tab.offsetHeight,
        left: box.width
          ? (rect.left - box.left) / scaleX - bar.clientLeft + bar.scrollLeft
          : tab.offsetLeft,
        top: box.height
          ? (rect.top - box.top) / scaleY - bar.clientTop + bar.scrollTop
          : tab.offsetTop,
        properties: typography.map(
          (property) =>
            [
              property,
              property === "font-family" && tabStyle.fontFamily === style.fontFamily
                ? "inherit"
                : tabStyle.getPropertyValue(property),
            ] as const,
        ),
      };
    });
    width = metrics[0]?.width || 84;
    height = metrics[0]?.height || 28;
    originX = metrics[0]?.left || 0;
    originY = metrics[0]?.top || 0;
    slot =
      metrics.length > 1
        ? Math.abs((vertical ? metrics[1]!.top : metrics[1]!.left) - (vertical ? originY : originX))
        : (vertical ? height : width) +
          (parseFloat(vertical ? style.rowGap : style.columnGap) || 0);
    for (const layer of [lens, tint]) {
      layer.style.left = `${originX}px`;
      layer.style.right = "auto";
      layer.style.top = `${originY}px`;
      layer.style.width = `${width}px`;
      layer.style.height = `${height}px`;
    }
    for (const target of [row, centreRow]) {
      target.style.gap = gap;
      for (const [index, metric] of metrics.entries()) {
        const copy = target.children[index] as HTMLElement;
        copy.style.width = `${metric.width}px`;
        copy.style.height = `${metric.height}px`;
        copy.style.boxSizing = "border-box";
        for (const [property, value] of metric.properties) copy.style.setProperty(property, value);
        copy.style.borderColor = "transparent";
      }
    }
    restInset = Math.max(
      0,
      Math.min(
        parseFloat(style.getPropertyValue("--lg-tabs-indicator-inset")) || 0,
        (width - 1) / 2,
        (height - 1) / 2,
      ),
    );
    growX = parseFloat(style.getPropertyValue("--lg-lens-grow-x")) || 0;
    growY = parseFloat(style.getPropertyValue("--lg-lens-grow-y")) || 0;
    optics.style.setProperty("--lg-bezel", (height * 0.2).toFixed(3));
    optics.style.setProperty("--lg-anchor-edge", "1");
    for (const [index, tab] of tabs.entries()) {
      tab.style.setProperty("--lg-tabs-tab-x", `${metrics[index]!.left}px`);
      tab.style.setProperty("--lg-tabs-tab-y", `${metrics[index]!.top}px`);
    }
    refraction.refit();
  };

  const paint = () => {
    const { x, lift } = state;
    const stretch = 1 + state.stretch;
    // Shrink only the resting lens; hit targets and dragged lift keep their geometry.
    const restingInset = 2 * restInset * (1 - lift);
    const sx = (1 + (growX * lift - restingInset) / width) * (vertical ? 1 / stretch : stretch);
    const sy = (1 + (growY * lift - restingInset) / height) * (vertical ? stretch : 1 / stretch);
    // Keep the rendered end caps circular under non-uniform lift/deformation.
    const radius = Math.min(width * sx, height * sy) / 2;
    for (const layer of [lens, tint])
      layer.style.borderRadius = `${radius / sx}px / ${radius / sy}px`;
    const physical = x * direction;
    const transform = `translate(${vertical ? 0 : physical}px, ${vertical ? physical : 0}px) scale(${sx}, ${sy})`;
    lens.style.setProperty("--lg-tabs-transform", transform);
    tint.style.setProperty("--lg-tabs-transform", transform);
    const rowTransform = `scale(${1 / sx}, ${1 / sy}) translate(${(vertical ? 0 : -physical) + ((sx - 1) * width) / 2}px, ${(vertical ? -physical : 0) + ((sy - 1) * height) / 2}px)`;
    row.style.transform = rowTransform;
    centreRow.style.transform = rowTransform;
    const inset = Math.min(height * 0.24, width / 2, height / 2);
    const innerWidth = width - inset * 2;
    const innerHeight = height - inset * 2;
    if (!ringClipSupported) {
      ring.style.display = "none";
      centre.style.removeProperty("clip-path");
    } else if (innerWidth > 0 && innerHeight > 0) {
      const rx = Math.max(0, Math.min(radius / sx - inset, innerWidth / 2));
      const ry = Math.max(0, Math.min(radius / sy - inset, innerHeight / 2));
      const right = width - inset;
      const bottom = height - inset;
      const hole = `M ${inset + rx} ${inset} H ${right - rx} A ${rx} ${ry} 0 0 1 ${right} ${inset + ry} V ${bottom - ry} A ${rx} ${ry} 0 0 1 ${right - rx} ${bottom} H ${inset + rx} A ${rx} ${ry} 0 0 1 ${inset} ${bottom - ry} V ${inset + ry} A ${rx} ${ry} 0 0 1 ${inset + rx} ${inset} Z`;
      ring.style.clipPath = `path(evenodd, "M 0 0 H ${width} V ${height} H 0 Z ${hole}")`;
      centre.style.clipPath = `inset(${inset}px round ${rx}px / ${ry}px)`;
    } else {
      ring.style.removeProperty("clip-path");
      centre.style.clipPath = "inset(50%)";
    }
    const maskWidth = width * sx;
    const maskHeight = height * sy;
    const maskX = originX + (vertical ? 0 : physical) + (width - maskWidth) / 2;
    const maskY = originY + (vertical ? physical : 0) + (height - maskHeight) / 2;
    const diameter = radius * 2;
    const horizontal = maskWidth >= maskHeight;
    bar.style.setProperty("--lg-tabs-mask-diameter", `${diameter}px`);
    bar.style.setProperty(
      "--lg-tabs-mask-middle-size",
      `${horizontal ? maskWidth - diameter : maskWidth}px ${horizontal ? maskHeight : maskHeight - diameter}px`,
    );
    bar.style.setProperty("--lg-tabs-mask-middle-x", `${maskX + (horizontal ? radius : 0)}px`);
    bar.style.setProperty("--lg-tabs-mask-middle-y", `${maskY + (horizontal ? 0 : radius)}px`);
    bar.style.setProperty("--lg-tabs-mask-start-x", `${maskX}px`);
    bar.style.setProperty("--lg-tabs-mask-start-y", `${maskY}px`);
    bar.style.setProperty("--lg-tabs-mask-end-x", `${maskX + maskWidth - diameter}px`);
    bar.style.setProperty("--lg-tabs-mask-end-y", `${maskY + maskHeight - diameter}px`);
    if (!gesture && lift < 0.01) delete bar.dataset["refracting"];
    refraction.setActive(lift > 0.01);
    refraction.update(lift);
  };

  const deformation = createSpring(0, ...deformationSpring, (value) => {
    state.stretch = value;
    paint();
  });
  const x = createSpring(0, REST[0], REST[1], (value) => {
    const now = performance.now();
    const elapsed = now - lastTime;
    const speed = elapsed > 0 && elapsed < 100 ? ((value - lastPosition) * 1000) / elapsed : 0;
    lastTime = now;
    lastPosition = value;
    state.x = value;
    deformation.set(prefersReducedMotion() ? 0 : velocityDeformation(speed, 0.12));
    paint();
  });
  const lift = createSpring(0, REST[2], REST[3], (value) => {
    state.lift = value;
    paint();
  });

  const move = (target: number, lifted: boolean, instant = false) => {
    if (instant) {
      lastTime = 0;
      lastPosition = target;
      deformation.set(0, true);
    }
    const [slideStiffness, slideDamping, liftStiffness, liftDamping] = gesture ? DRAG : REST;
    x.tune(slideStiffness, slideDamping);
    lift.tune(liftStiffness, liftDamping);
    x.set(target, instant);
    lift.set(lifted ? 1 : 0, instant);
  };

  const settle = (instant = false) => {
    if (gesture) return;
    const show = active >= 0;
    if (show) delete bar.dataset["hidden"];
    else bar.dataset["hidden"] = "";
    if (show) move(active * slot, false, instant || !shown);
    shown = show;
  };

  const position = (event: PointerEvent) =>
    clamp(
      gesture!.anchor + (coordinate(event) - gesture!.x) * direction,
      0,
      slot * (tabs.length - 1),
    );

  const light = (event: PointerEvent, box: DOMRect) => {
    glass.style.setProperty(
      "--lg-x",
      `${clamp(((event.clientX - box.left) / box.width) * 100, 0, 100)}%`,
    );
    lens.style.setProperty(
      "--lg-x",
      `${clamp(((event.clientX - box.left - padding - (vertical ? 0 : state.x)) / width) * 100, 0, 100)}%`,
    );
  };

  const release = () => {
    const old = gesture;
    gesture = null;
    delete bar.dataset["lifted"];
    delete lens.dataset["pressed"];
    if (old && bar.hasPointerCapture(old.id)) bar.releasePointerCapture(old.id);
    return old;
  };

  let suppressClick = false;

  const onPointerDown = (event: PointerEvent) => {
    const tab = (event.target as Element).closest<HTMLElement>(itemSelector);
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      gesture ||
      !tab ||
      event.defaultPrevented ||
      bar.matches("[aria-disabled='true'], [aria-readonly='true']") ||
      tab.matches(":disabled, [data-disabled], [aria-disabled='true']")
    )
      return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    bar.dataset["pointerFocus"] = "";
    cancelAnimationFrame(settleFrame);
    settleFrame = 0;
    measure();
    const box = bar.getBoundingClientRect();
    gesture = {
      id: event.pointerId,
      x: coordinate(event),
      anchor: tabs.indexOf(tab) * slot,
      moved: false,
      box,
      at: performance.now(),
    };
    suppressClick = false;
    bar.dataset["lifted"] = "";
    bar.dataset["refracting"] = "";
    delete bar.dataset["hidden"];
    lens.dataset["pressed"] = "";
    light(event, box);
    move(gesture.anchor, true, !shown);
    shown = true;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerId !== gesture?.id) return;
    if (!gesture.moved && Math.abs(coordinate(event) - gesture.x) > 6) {
      gesture.moved = true;
      bar.setPointerCapture(event.pointerId);
    }
    if (gesture.moved) move(position(event), true);
    light(event, gesture.box);
  };

  const onPointerEnd = (event: PointerEvent) => {
    if (event.pointerId !== gesture?.id) return;
    // Touch implicitly captures the tab before a drag captures the bar. The
    // tab's bubbling capture-loss event is a handoff, not the end of the drag.
    if (event.type === "lostpointercapture" && event.target !== bar) return;
    const index = Math.round(position(event) / slot);
    const { moved, box, at } = release()!;
    // A drag selects wherever it leaves the lens, even released off the bar.
    // A tap only counts if it ends on the bar, as with a button.
    const near = vertical
      ? event.clientX >= box.left - 24 && event.clientX <= box.right + 24
      : event.clientY >= box.top - 24 && event.clientY <= box.bottom + 24;
    if (event.type === "pointerup" && (moved || near)) {
      // Activate taps and drags at release, before settling. Waiting for the
      // browser's click briefly sends the lens back toward the old selection.
      suppressClick = true;
      // Returning a dragged lens is not a reselect action. Consumers may use
      // deliberate clicks on the selected tab to reset panel scroll or state.
      if (held(at, moved) && index === active) {
        settle();
        return;
      }
      // React may commit a controlled selection after the click handler. Use
      // its new value, or settle back if the consumer declines the change.
      settleFrame = requestAnimationFrame(() => {
        settleFrame = 0;
        settle();
        const target = tabs[index];
        if (target?.getAttribute(selectedAttribute) === "true")
          target.focus({ preventScroll: true });
      });
      tabs[index]?.click();
    } else {
      suppressClick = moved;
      settle();
    }
  };

  // A quick swipe that starts on the bar still scrolls the page, but a press
  // that has rested there, or a drag already under way, keeps the touch.
  const onTouchMove = (event: TouchEvent) => {
    if (gesture && event.cancelable && held(gesture.at, gesture.moved)) event.preventDefault();
  };

  const onClick = (event: MouseEvent) => {
    if (event.isTrusted && suppressClick && event.detail !== 0) {
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  const reset = () => {
    cancelAnimationFrame(settleFrame);
    settleFrame = 0;
    release();
    settle(true);
  };
  const onVisibilityChange = () => {
    if (document.hidden) reset();
  };
  const observer = new ResizeObserver(() => {
    measure();
    if (!gesture) settle(true);
  });

  const onKeyDown = () => {
    delete bar.dataset["pointerFocus"];
  };

  measure();
  bar.dataset["ready"] = "";
  bar.addEventListener("pointerdown", onPointerDown);
  // A mouse isn't captured until it has moved, so follow it past the bar.
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerEnd);
  window.addEventListener("pointercancel", onPointerEnd);
  bar.addEventListener("lostpointercapture", onPointerEnd);
  bar.addEventListener("touchmove", onTouchMove, { passive: false });
  bar.addEventListener("click", onClick, true);
  document.addEventListener("visibilitychange", onVisibilityChange);
  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("blur", reset);
  observer.observe(bar);

  return {
    setActive(index) {
      active = index;
      if (bar.matches("[aria-disabled='true'], [aria-readonly='true']")) reset();
      measure();
      settle();
    },
    destroy() {
      cancelAnimationFrame(settleFrame);
      x.stop();
      deformation.stop();
      lens.style.removeProperty("border-radius");
      tint.style.removeProperty("border-radius");
      lift.stop();
      refraction.destroy();
      observer.disconnect();
      lens.style.removeProperty("--lg-tabs-transform");
      tint.style.removeProperty("--lg-tabs-transform");
      for (const layer of [lens, tint])
        for (const property of ["left", "right", "top", "width", "height"])
          layer.style.removeProperty(property);
      for (const tab of tabs) {
        tab.style.removeProperty("--lg-tabs-tab-x");
        tab.style.removeProperty("--lg-tabs-tab-y");
      }
      for (const name of [
        "diameter",
        "middle-size",
        "middle-x",
        "middle-y",
        "start-x",
        "start-y",
        "end-x",
        "end-y",
      ])
        bar.style.removeProperty(`--lg-tabs-mask-${name}`);
      for (const key of ["ready", "hidden", "lifted", "refracting", "pointerFocus"])
        delete bar.dataset[key];
      bar.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
      bar.removeEventListener("lostpointercapture", onPointerEnd);
      bar.removeEventListener("touchmove", onTouchMove);
      bar.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("blur", reset);
    },
  };
}

function present(bar: HTMLElement, kind: SegmentedPresentationKind) {
  const itemSelector =
    kind === "tabs"
      ? "[data-slot='tabs-tab']:not([data-tabs-overflow])"
      : "[data-slot='segmented-control-item']";
  const selectedAttribute = kind === "tabs" ? "aria-selected" : "aria-checked";
  let current: Controller | undefined;
  let signature = "";
  let currentLens: HTMLElement | undefined;
  const sync = () => {
    const tabs = [...bar.querySelectorAll<HTMLElement>(itemSelector)];
    const glass = bar.querySelector<HTMLElement>(`[data-slot='${kind}-glass']`);
    const lens = [...bar.querySelectorAll<HTMLElement>("[data-lg-tabs-lens]")].find(
      (node) => node.offsetHeight > 0,
    );
    const tint = bar.querySelector<HTMLElement>(`[data-slot='${kind}-tint']`);
    const row = bar.querySelector<HTMLElement>(`[data-slot='${kind}-row']`);
    const centreRow = bar.querySelector<HTMLElement>(`[data-slot='${kind}-centre-row']`);
    const ring = bar.querySelector<HTMLElement>(`[data-slot='${kind}-highlight-ring']`);
    const centre = bar.querySelector<HTMLElement>(`[data-slot='${kind}-highlight-centre']`);
    const optics = bar.querySelector<HTMLElement>(`[data-slot='${kind}-highlight-optics']`);
    if (!tabs.length) {
      current?.destroy();
      current = undefined;
      currentLens = undefined;
      signature = "";
      row?.replaceChildren();
      centreRow?.replaceChildren();
      bar.dataset["hidden"] = "";
      return;
    }
    if (
      !glass ||
      !lens ||
      !tint ||
      !row ||
      !centreRow ||
      !ring ||
      !centre ||
      !optics ||
      !lens.offsetHeight
    )
      return;
    const nextSignature =
      bar.getAttribute("data-orientation") +
      tabs.map((tab) => tab.id + ":" + tab.innerHTML).join("\n");
    if (!current || nextSignature !== signature || currentLens !== lens) {
      currentLens = lens;
      current?.destroy();
      signature = nextSignature;
      const compiled = stylex.props(tabsStyles.copy);
      for (const target of [row, centreRow])
        target.replaceChildren(...tabs.map((tab) => copyTab(tab, compiled.className ?? "")));
      current = attach({ kind, bar, glass, lens, tint, row, centreRow, ring, centre, optics });
    }
    current.setActive(tabs.findIndex((tab) => tab.getAttribute(selectedAttribute) === "true"));
  };
  const observer = new MutationObserver((records) => {
    if (
      records.every((record) =>
        (record.target instanceof Element ? record.target : record.target.parentElement)?.closest(
          `[data-slot='${kind}-row'], [data-slot='${kind}-centre-row']`,
        ),
      )
    )
      return;
    sync();
  });
  observer.observe(bar, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [
      "aria-selected",
      "aria-checked",
      "aria-disabled",
      "aria-readonly",
      "data-active",
      "disabled",
      "hidden",
      "data-tabs-overflow",
      "data-orientation",
      "class",
    ],
  });
  sync();
  return () => {
    observer.disconnect();
    current?.destroy();
  };
}
export function useSegmentedListRef(
  ref: Ref<HTMLDivElement> | undefined,
  enabled: boolean,
  kind: SegmentedPresentationKind,
) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useEffect(
    () => (element && enabled ? present(element, kind) : undefined),
    [element, enabled, kind],
  );
  return useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
}
export function useTabsListRef(ref: Ref<HTMLDivElement> | undefined, enabled: boolean) {
  return useSegmentedListRef(ref, enabled, "tabs");
}
