// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted for variable-width navigation links and native link activation.
import { useCallback, useEffect, useState, type Ref } from "react";
import { assignRef } from "../../utils/interaction/ref.js";
import { createLabelRefraction } from "../../utils/materials/control-lens.js";
import {
  createSpring,
  prefersReducedMotion,
  deformationSpring,
  velocityDeformation,
} from "@lenso/glass/motion";

const REST = [1024, 58.9, 676, 47.8] as const;
const DRAG = [2500, 94, 576, 44.2] as const;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const pixels = (value: string) => parseFloat(value) || 0;
let nextCopyId = 0;

function copyItemContent(item: HTMLElement) {
  const copy = document.createElement("span");
  copy.className = item.className;
  copy.style.cssText = item.style.cssText;
  for (const attribute of [...item.attributes]) {
    const name = attribute.name;
    if (
      (name.startsWith("data-") &&
        !name.startsWith("data-tab-bar-") &&
        name !== "data-testid" &&
        name !== "data-slot") ||
      name === "aria-current" ||
      name === "dir" ||
      name === "lang"
    )
      copy.setAttribute(name, attribute.value);
  }
  for (const child of item.children) {
    if (child.hasAttribute("data-tab-bar-content") || child.querySelector("[data-tab-bar-content]"))
      copy.append(child.cloneNode(true));
  }
  for (const fallback of copy.querySelectorAll("[data-tab-bar-fallback]")) fallback.remove();
  const nodes = [copy, ...copy.querySelectorAll<HTMLElement | SVGElement>("*")];
  const ids = new Map<string, string>();
  const prefix = `lenso-tab-bar-copy-${++nextCopyId}-`;
  for (const node of nodes) {
    const id = node.getAttribute("id");
    if (id) {
      const replacement = `${prefix}${ids.size}`;
      ids.set(id, replacement);
      node.setAttribute("id", replacement);
    }
    node.removeAttribute("data-testid");
    node.removeAttribute("autofocus");
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
  Object.assign(copy.style, {
    position: "absolute",
    margin: "0",
    outline: "none",
    backgroundColor: "transparent",
    textDecoration: "none",
    transition: "none",
    pointerEvents: "none",
  });
  return copy;
}

function present(group: HTMLElement) {
  const list = group.querySelector<HTMLElement>("[data-tab-bar-list]");
  const indicator = group.querySelector<HTMLElement>("[data-slot='tab-bar-indicator']");
  const highlight = group.querySelector<HTMLElement>("[data-slot='tab-bar-highlight']");
  const highlightRow = group.querySelector<HTMLElement>("[data-slot='tab-bar-highlight-row']");
  const highlightRing = group.querySelector<HTMLElement>("[data-slot='tab-bar-highlight-ring']");
  const highlightCentre = group.querySelector<HTMLElement>(
    "[data-slot='tab-bar-highlight-centre']",
  );
  const centreRow = group.querySelector<HTMLElement>("[data-slot='tab-bar-highlight-centre-row']");
  if (
    !list ||
    !indicator ||
    !highlight ||
    !highlightRow ||
    !highlightRing ||
    !highlightCentre ||
    !centreRow
  )
    return;
  const contentOptics = highlight.querySelector<HTMLElement>(
    "[data-slot='tab-bar-highlight-optics']",
  );
  const refraction = contentOptics ? createLabelRefraction(contentOptics) : undefined;
  let growY = 20;
  const ringClipSupported = CSS.supports("clip-path", 'path(evenodd, "M 0 0 H 1 V 1 H 0 Z")');
  const items = () => [...list.querySelectorAll<HTMLElement>("[data-tab-bar-item]")];
  const enabled = (item: HTMLElement) =>
    !item.matches(':disabled, [data-disabled], [aria-disabled="true"]');
  const metrics = () => {
    const outer = group.getBoundingClientRect();
    const style = getComputedStyle(group);
    const configuredLift = parseFloat(style.getPropertyValue("--tab-bar-lift"));
    growY = Number.isFinite(configuredLift) ? Math.max(0, configuredLift) : 20;
    const extraX =
      style.boxSizing === "border-box"
        ? 0
        : pixels(style.paddingLeft) +
          pixels(style.paddingRight) +
          pixels(style.borderLeftWidth) +
          pixels(style.borderRightWidth);
    const extraY =
      style.boxSizing === "border-box"
        ? 0
        : pixels(style.paddingTop) +
          pixels(style.paddingBottom) +
          pixels(style.borderTopWidth) +
          pixels(style.borderBottomWidth);
    const width = pixels(style.width) + extraX || group.offsetWidth || 1;
    const height = pixels(style.height) + extraY || group.offsetHeight || 1;
    return { outer, scaleX: outer.width / width || 1, scaleY: outer.height / height || 1 };
  };
  const box = (item: HTMLElement) => {
    const { outer, scaleX, scaleY } = metrics();
    const rect = item.getBoundingClientRect();
    const inset = group.dataset["layout"] === "tablet" ? 4 : 0;
    return {
      x: (rect.left - outer.left) / scaleX,
      y: (rect.top - outer.top) / scaleY + inset,
      width: rect.width / scaleX,
      height: rect.height / scaleY - inset * 2,
    };
  };
  let active: HTMLElement | undefined;
  let shown = false;
  let settleFrame = 0;
  let suppressClick = false;
  let suppressTimer = 0;
  let gesture:
    | {
        id: number;
        start: number;
        center: number;
        moved: boolean;
        origin: HTMLElement;
        animated: boolean;
      }
    | undefined;
  const state = { x: 0, y: 0, width: 0, height: 0, lift: 0, stretch: 0 };
  let previousX = 0;
  let previousTime = 0;
  let opticalHeight = 0;
  let settledBox: ReturnType<typeof box> | undefined;
  let copies: { item: HTMLElement; copy: HTMLElement; centre: HTMLElement }[] = [];
  let batching = false;
  const minimized = () =>
    group.hasAttribute("data-tab-bar-resizing") || group.hasAttribute("data-minimized");

  const layoutCopies = () => {
    const { outer, scaleX, scaleY } = metrics();
    const listBox = list.getBoundingClientRect();
    const placements = copies.map(({ item, copy, centre }) => {
      const rect = item.getBoundingClientRect();
      const left = Math.max(0, (listBox.left - rect.left) / scaleX);
      const right = Math.max(0, (rect.right - listBox.right) / scaleX);
      return {
        copy,
        centre,
        left: `${(rect.left - outer.left) / scaleX}px`,
        top: `${(rect.top - outer.top) / scaleY}px`,
        width: `${rect.width / scaleX}px`,
        height: `${rect.height / scaleY}px`,
        clipPath: `inset(0 ${right}px 0 ${left}px)`,
      };
    });
    for (const { copy, centre, ...styles } of placements) {
      Object.assign(copy.style, styles);
      Object.assign(centre.style, styles);
    }
  };
  const updateCopies = () => {
    copies = items()
      .filter((item) => item.hasAttribute("data-tab-bar-destination") && enabled(item))
      .map((item) => ({ item, copy: copyItemContent(item), centre: copyItemContent(item) }));
    highlightRow.replaceChildren(...copies.map(({ copy }) => copy));
    centreRow.replaceChildren(...copies.map(({ centre }) => centre));
    layoutCopies();
    const current = copies.find(({ item }) => item.hasAttribute("data-current"));
    const color = current ? getComputedStyle(current.copy).color : "var(--lenso-tint)";
    for (const { copy, centre } of copies) {
      copy.style.color = color;
      centre.style.color = color;
    }
  };

  const paint = () => {
    if (batching || state.width <= 0 || state.height <= 0) return;
    if (opticalHeight !== state.height) {
      opticalHeight = state.height;
      contentOptics?.style.setProperty("--lg-bezel", (state.height * 0.2).toFixed(3));
      contentOptics?.style.setProperty("--lg-anchor-edge", "1");
    }
    const stretch = 1 + state.stretch;
    const sx = (1 + (Math.round((growY * 4) / 3) / state.width) * state.lift) * stretch;
    const sy = (1 + (growY / state.height) * state.lift) / stretch;
    const radius = Math.min(state.width * sx, state.height * sy) / 2;
    const inset = Math.min(state.height * 0.24, state.width / 2, state.height / 2);
    const innerWidth = state.width - inset * 2;
    const innerHeight = state.height - inset * 2;
    if (!ringClipSupported) {
      highlightRing.style.display = "none";
      highlightCentre.style.removeProperty("clip-path");
    } else if (innerWidth > 0 && innerHeight > 0) {
      const rx = Math.max(0, Math.min(radius / sx - inset, innerWidth / 2));
      const ry = Math.max(0, Math.min(radius / sy - inset, innerHeight / 2));
      const right = state.width - inset;
      const bottom = state.height - inset;
      const hole = `M ${inset + rx} ${inset} H ${right - rx} A ${rx} ${ry} 0 0 1 ${right} ${inset + ry} V ${bottom - ry} A ${rx} ${ry} 0 0 1 ${right - rx} ${bottom} H ${inset + rx} A ${rx} ${ry} 0 0 1 ${inset} ${bottom - ry} V ${inset + ry} A ${rx} ${ry} 0 0 1 ${inset + rx} ${inset} Z`;
      highlightRing.style.clipPath = `path(evenodd, "M 0 0 H ${state.width} V ${state.height} H 0 Z ${hole}")`;
      highlightCentre.style.clipPath = `inset(${inset}px round ${rx}px / ${ry}px)`;
    } else {
      highlightRing.style.removeProperty("clip-path");
      highlightCentre.style.clipPath = "inset(50%)";
    }
    const maskWidth = state.width * sx;
    const maskHeight = state.height * sy;
    const maskX = state.x + (state.width - maskWidth) / 2;
    const maskY = state.y + (state.height - maskHeight) / 2;
    const diameter = radius * 2;
    const horizontal = maskWidth >= maskHeight;
    group.style.setProperty("--tab-bar-mask-diameter", `${diameter}px`);
    group.style.setProperty(
      "--tab-bar-mask-middle-size",
      `${horizontal ? maskWidth - diameter : maskWidth}px ${horizontal ? maskHeight : maskHeight - diameter}px`,
    );
    group.style.setProperty(
      "--tab-bar-mask-middle-position",
      `${maskX + (horizontal ? radius : 0)}px ${maskY + (horizontal ? 0 : radius)}px`,
    );
    group.style.setProperty("--tab-bar-mask-start", `${maskX}px ${maskY}px`);
    group.style.setProperty(
      "--tab-bar-mask-end",
      `${maskX + maskWidth - diameter}px ${maskY + maskHeight - diameter}px`,
    );
    for (const layer of [indicator, highlight]) {
      layer.style.width = `${state.width}px`;
      layer.style.height = `${state.height}px`;
      layer.style.borderRadius = `${radius / sx}px / ${radius / sy}px`;
      layer.style.transform = `translate(${state.x}px, ${state.y}px) scale(${sx}, ${sy})`;
    }
    const rowX = state.width / 2 - (state.x + state.width / 2) / sx;
    const rowY = state.height / 2 - (state.y + state.height / 2) / sy;
    const rowTransform = `translate(${rowX}px, ${rowY}px) scale(${1 / sx}, ${1 / sy})`;
    highlightRow.style.transform = rowTransform;
    centreRow.style.transform = rowTransform;
    refraction?.setActive(state.lift > 0.01);
    refraction?.update(state.lift);
    if (
      !gesture &&
      settledBox &&
      state.lift < 0.01 &&
      Math.abs(state.stretch) < 0.01 &&
      Math.abs(state.x - settledBox.x) < 0.1 &&
      Math.abs(state.width - settledBox.width) < 0.1
    )
      delete group.dataset["highlightActive"];
    if (!gesture && state.lift < 0.01) delete group.dataset["refracting"];
  };
  const deformation = createSpring(0, ...deformationSpring, (value) => {
    state.stretch = value;
    paint();
  });
  const position = createSpring(0, REST[0], REST[1], (value) => {
    const now = performance.now();
    const elapsed = now - previousTime;
    const speed = elapsed > 0 && elapsed < 100 ? ((value - previousX) * 1000) / elapsed : 0;
    previousTime = now;
    previousX = value;
    state.x = value;
    if (!batching) deformation.set(prefersReducedMotion() ? 0 : velocityDeformation(speed, 0.12));
    paint();
  });
  const width = createSpring(0, REST[0], REST[1], (value) => {
    state.width = value;
    paint();
  });
  const lift = createSpring(0, REST[2], REST[3], (value) => {
    state.lift = value;
    paint();
  });
  const move = (target: ReturnType<typeof box>, lifted: boolean, instant = false) => {
    const [slideStiffness, slideDamping, liftStiffness, liftDamping] = gesture ? DRAG : REST;
    position.tune(slideStiffness, slideDamping);
    width.tune(slideStiffness, slideDamping);
    lift.tune(liftStiffness, liftDamping);
    state.y = target.y;
    state.height = target.height;
    batching = instant;
    try {
      if (instant) {
        previousTime = 0;
        previousX = target.x;
        deformation.set(0, true);
      }
      width.set(target.width, instant);
      position.set(target.x, instant);
      lift.set(lifted ? 1 : 0, instant);
    } finally {
      batching = false;
    }
    if (instant) paint();
  };
  const sync = (instant = false) => {
    if (minimized()) return;
    const all = items();
    list.toggleAttribute("data-overflow", list.scrollWidth > list.clientWidth + 1);
    layoutCopies();
    const previousActive = active;
    active = all.find((item) => item.hasAttribute("data-current"));
    if (gesture?.moved) return;
    if (gesture && active === previousActive) return;
    if (!active) {
      group.dataset["indicatorHidden"] = "";
      delete group.dataset["highlightActive"];
      settledBox = undefined;
      lift.set(0, instant);
      shown = false;
      return;
    }
    const target = box(active);
    settledBox = target;
    const visible = target.x + target.width > 0 && target.x < group.clientWidth;
    group.toggleAttribute("data-indicator-hidden", !visible);
    if (visible) {
      if (
        shown &&
        (Math.abs(state.x - target.x) >= 0.1 || Math.abs(state.width - target.width) >= 0.1)
      )
        group.dataset["highlightActive"] = "";
      move(target, !!gesture?.animated, instant || !shown);
    }
    shown = visible;
  };
  const nearest = (clientX: number) => {
    const candidates = items()
      .filter((item) => item.hasAttribute("data-tab-bar-destination") && enabled(item))
      .filter((item) => item.getClientRects().length > 0);
    return candidates.reduce<HTMLElement | undefined>((best, item) => {
      const rect = item.getBoundingClientRect();
      const distance = Math.abs(clientX - (rect.left + rect.width / 2));
      if (!best) return item;
      const prior = best.getBoundingClientRect();
      return distance < Math.abs(clientX - (prior.left + prior.width / 2)) ? item : best;
    }, undefined);
  };
  const light = (event: PointerEvent) => {
    const rect = indicator.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
    const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
    indicator.style.setProperty("--lg-x", `${clamp(x, 0, 100)}%`);
    indicator.style.setProperty("--lg-y", `${clamp(y, 0, 100)}%`);
  };
  const down = (event: PointerEvent) => {
    const item =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-tab-bar-item]")
        : null;
    if (
      !event.isPrimary ||
      minimized() ||
      event.button !== 0 ||
      gesture ||
      !item ||
      !item.hasAttribute("data-tab-bar-destination") ||
      !list.contains(item) ||
      !enabled(item) ||
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const rect = item.getBoundingClientRect();
    gesture = {
      id: event.pointerId,
      start: event.clientX,
      center: rect.left + rect.width / 2,
      moved: false,
      origin: item,
      animated: !prefersReducedMotion(),
    };
    cancelAnimationFrame(settleFrame);
    if (gesture.animated) {
      delete group.dataset["indicatorHidden"];
      group.dataset["lifted"] = "";
      group.dataset["refracting"] = "";
      group.dataset["highlightActive"] = "";
      indicator.dataset["pressed"] = "";
      move(box(item), true, !shown);
      light(event);
      shown = true;
    }
  };
  const movePointer = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    if (!gesture.moved && Math.abs(event.clientX - gesture.start) > 6) {
      gesture.moved = true;
      group.dataset["highlightActive"] = "";
      group.setPointerCapture(event.pointerId);
      delete group.dataset["indicatorHidden"];
      if (!shown) move(box(gesture.origin), gesture.animated, true);
      shown = true;
    }
    if (!gesture.moved) return;
    const all = items().filter(
      (item) => item.hasAttribute("data-tab-bar-destination") && enabled(item),
    );
    if (!all.length) return;
    const centers = all.map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
    const center = clamp(
      gesture.center + event.clientX - gesture.start,
      Math.min(...centers),
      Math.max(...centers),
    );
    const item = nearest(center);
    if (!item) return;
    const target = box(item);
    const { outer, scaleX } = metrics();
    target.x = (center - outer.left) / scaleX - target.width / 2;
    move(target, gesture.animated);
    if (gesture.animated) light(event);
    if (event.cancelable) event.preventDefault();
  };
  const end = (event?: PointerEvent) => {
    if (!gesture || (event && event.pointerId !== gesture.id)) return;
    if (event?.type === "lostpointercapture" && event.target !== group) return;
    const old = gesture;
    const hit =
      event?.type === "pointerup"
        ? group.ownerDocument
            .elementFromPoint(event.clientX, event.clientY)
            ?.closest<HTMLElement>("[data-tab-bar-item]")
        : undefined;
    const blockedHit =
      hit && list.contains(hit) && (!hit.hasAttribute("data-tab-bar-destination") || !enabled(hit));
    const destination =
      event?.type === "pointerup" && old.moved && !blockedHit ? nearest(event.clientX) : undefined;
    gesture = undefined;
    delete group.dataset["lifted"];
    delete indicator.dataset["pressed"];
    if (group.hasPointerCapture(old.id)) group.releasePointerCapture(old.id);
    if (event?.type === "pointerup" && old.moved) {
      suppressClick = true;
      clearTimeout(suppressTimer);
      suppressTimer = window.setTimeout(() => {
        suppressClick = false;
      }, 0);
      destination?.click();
    }
    cancelAnimationFrame(settleFrame);
    settleFrame = requestAnimationFrame(() => {
      settleFrame = 0;
      sync();
    });
  };
  const click = (event: MouseEvent) => {
    if (suppressClick && event.isTrusted && event.detail !== 0) {
      suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  const dragStart = (event: DragEvent) => {
    if (gesture) event.preventDefault();
  };
  const reset = () => {
    end();
    sync(true);
  };
  const visibility = () => {
    if (document.hidden) reset();
  };
  let resizeFrame = 0;
  const resize = new ResizeObserver(() => {
    if (resizeFrame || minimized()) return;
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0;
      sync(true);
    });
  });
  const observedItems = new Set<HTMLElement>();
  const observeItems = () => {
    const next = new Set(items());
    for (const item of observedItems) {
      if (!next.has(item)) {
        resize.unobserve(item);
        observedItems.delete(item);
      }
    }
    for (const item of next) {
      if (!observedItems.has(item)) {
        resize.observe(item);
        observedItems.add(item);
      }
    }
  };
  const mutation = new MutationObserver((records) => {
    if (records.some((record) => record.type === "childList")) observeItems();
    if (minimized()) return;
    updateCopies();
    sync();
  });
  const appearance = () =>
    [...group.style]
      .filter((name) => !name.startsWith("--tab-bar-") && name !== "--lg-x" && name !== "--lg-y")
      .map((name) => `${name}:${group.style.getPropertyValue(name)}`)
      .join(";");
  let groupAppearance = appearance();
  const scopeMutation = new MutationObserver((records) => {
    const next = appearance();
    const changed = next !== groupAppearance;
    groupAppearance = next;
    if (
      !minimized() &&
      (changed ||
        records.some((record) => record.target !== group || record.attributeName !== "style"))
    )
      updateCopies();
  });
  const minimize = new MutationObserver(() => {
    if (minimized()) {
      end();
      for (const spring of [position, width, lift, deformation]) spring.stop();
      refraction?.setActive(false);
      delete group.dataset["highlightActive"];
      delete group.dataset["refracting"];
    } else {
      updateCopies();
      sync(true);
    }
  });
  minimize.observe(group, {
    attributes: true,
    attributeFilter: ["data-tab-bar-resizing", "data-minimized"],
  });
  scopeMutation.observe(group, {
    attributes: true,
    attributeFilter: ["class", "style", "data-theme"],
  });
  for (let node = group.parentElement; node; node = node.parentElement)
    scopeMutation.observe(node, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
  resize.observe(group);
  resize.observe(list);
  observeItems();
  mutation.observe(list, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [
      "data-current",
      "disabled",
      "aria-disabled",
      "hidden",
      "class",
      "style",
      "src",
      "href",
      "xlink:href",
      "fill",
      "stroke",
      "d",
    ],
  });
  list.addEventListener("scroll", reset, { passive: true });
  group.addEventListener("pointerdown", down);
  group.addEventListener("click", click, true);
  group.addEventListener("dragstart", dragStart);
  group.addEventListener("lostpointercapture", end);
  window.addEventListener("pointermove", movePointer);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
  window.addEventListener("blur", reset);
  document.addEventListener("visibilitychange", visibility);
  updateCopies();
  sync(true);
  refraction?.refit();
  group.dataset["indicatorReady"] = "";
  return () => {
    cancelAnimationFrame(settleFrame);
    cancelAnimationFrame(resizeFrame);
    clearTimeout(suppressTimer);
    if (gesture && group.hasPointerCapture(gesture.id)) group.releasePointerCapture(gesture.id);
    for (const spring of [position, width, lift, deformation]) spring.stop();
    refraction?.destroy();
    resize.disconnect();
    mutation.disconnect();
    scopeMutation.disconnect();
    minimize.disconnect();
    list.removeEventListener("scroll", reset);
    group.removeEventListener("pointerdown", down);
    group.removeEventListener("click", click, true);
    group.removeEventListener("dragstart", dragStart);
    group.removeEventListener("lostpointercapture", end);
    window.removeEventListener("pointermove", movePointer);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    window.removeEventListener("blur", reset);
    document.removeEventListener("visibilitychange", visibility);
    for (const key of [
      "indicatorReady",
      "indicatorHidden",
      "lifted",
      "refracting",
      "highlightActive",
    ])
      delete group.dataset[key];
    delete indicator.dataset["pressed"];
    for (const layer of [indicator, highlight]) {
      for (const property of ["width", "height", "border-radius", "transform", "--lg-x", "--lg-y"])
        layer.style.removeProperty(property);
    }
    highlightRow.replaceChildren();
    highlightRow.style.removeProperty("transform");
    centreRow.replaceChildren();
    centreRow.style.removeProperty("transform");
    highlightRing.style.removeProperty("clip-path");
    highlightRing.style.removeProperty("display");
    highlightCentre.style.removeProperty("clip-path");
    for (const property of ["--lg-bezel", "--lg-anchor-edge"])
      contentOptics?.style.removeProperty(property);
    for (const property of ["diameter", "middle-size", "middle-position", "start", "end"])
      group.style.removeProperty(`--tab-bar-mask-${property}`);
  };
}

export function useTabBarMotionRef(ref: Ref<HTMLDivElement> | undefined, enabled: boolean) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useEffect(() => (element && enabled ? present(element) : undefined), [element, enabled]);
  return useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
}
