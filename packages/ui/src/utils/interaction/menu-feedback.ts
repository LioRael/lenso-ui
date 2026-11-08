// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Shared root/submenu feedback; native Menu owns focus and activation.
import { createSpring } from "@lenso/glass/motion";
import { createNativeMenuFeedback } from "./menu-feedback-native.js";
const resistance = (value: number) =>
  Math.sign(value) * 7 * (1 - Math.exp((-Math.abs(value) * 0.12) / 7));

export function presentMenuFeedback(card: HTMLElement, family: "menu" | "select" = "menu") {
  const content = card.querySelector<HTMLElement>(
    family === "select" ? "[data-select-content]" : '[data-slot="menu-content"]',
  )!;
  const plate = card.querySelector<HTMLElement>(`[data-slot="${family}-plate"]`)!;
  const popupSelector = `[data-slot="${family === "select" ? "select-popover" : "menu-popup"}"]`;
  const native = createNativeMenuFeedback(card);
  const offset = { x: 0, y: 0 };
  const paint = () => {
    card.style.setProperty("--lg-menu-translate", `${offset.x}px ${offset.y}px`);
  };
  const scale =
    native?.scale ??
    createSpring(1, 650, 36, (value) => {
      card.style.setProperty("--lg-menu-scale", String(value));
    });
  const x =
    native?.x ??
    createSpring(0, 600, 30, (value) => {
      offset.x = value;
      paint();
    });
  const y =
    native?.y ??
    createSpring(0, 600, 30, (value) => {
      offset.y = value;
      paint();
    });
  let gesture: { id: number; x: number; y: number } | null = null;
  let current: HTMLElement | null = null;
  let pointerInside = false;
  let suppressClickUntil = 0;
  card.setAttribute("data-menu-plate-active", "");
  const highlight = (row: HTMLElement | null) => {
    if (current === row) return;
    const first = !current;
    current = row;
    if (!row) {
      card.removeAttribute("data-scrubbing");
      plate.style.opacity = "0";
      return;
    }
    const width = row.offsetWidth,
      height = row.offsetHeight;
    const rowStyle = getComputedStyle(row);
    const radius = rowStyle.borderRadius,
      color = rowStyle.getPropertyValue("--lenso-menu-highlight");
    let left = row.offsetLeft,
      top = row.offsetTop;
    for (
      let parent = row.offsetParent as HTMLElement | null;
      parent && parent !== content;
      parent = parent.offsetParent as HTMLElement | null
    ) {
      left += parent.offsetLeft;
      top += parent.offsetTop;
    }
    card.setAttribute("data-scrubbing", "");
    plate.style.width = `${width}px`;
    plate.style.height = `${height}px`;
    plate.style.borderRadius = radius;
    plate.style.backgroundColor = color;
    if (first) plate.style.transition = "none";
    plate.style.transform = `translate(${left}px, ${top}px)`;
    plate.style.opacity = "1";
    if (first) {
      void plate.offsetWidth;
      plate.style.transition = "";
    }
  };
  const rowAt = (clientX: number, clientY: number) => {
    const row = document
      .elementFromPoint(clientX, clientY)
      ?.closest<HTMLElement>(
        family === "select"
          ? '[role="option"]'
          : '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]',
      );
    return row &&
      !row.matches(':disabled, [data-disabled], [aria-disabled="true"]') &&
      row.closest(popupSelector) === card
      ? row
      : null;
  };
  const syncHighlight = () => {
    if (gesture) return;
    const row = [
      ...content.querySelectorAll<HTMLElement>("[data-highlighted], [data-popup-open]"),
    ].find((node) => node.closest(popupSelector) === card && !node.hasAttribute("data-disabled"));
    if (row || !pointerInside) highlight(row ?? null);
  };
  const highlights = new MutationObserver(syncHighlight);
  highlights.observe(content, {
    subtree: true,
    attributes: true,
    attributeFilter: ["data-highlighted", "data-popup-open"],
  });
  syncHighlight();
  const down = (event: PointerEvent) => {
    if (
      card.getAttribute("data-menu-elastic") === "false" ||
      !event.isPrimary ||
      event.button !== 0 ||
      event.defaultPrevented ||
      !card.hasAttribute("data-open")
    )
      return;
    // Let native scrolling own touch gestures in a constrained menu.
    if (event.pointerType !== "mouse" && content.scrollHeight > content.clientHeight + 1) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    card.setPointerCapture(event.pointerId);
    card.setAttribute("data-pressed", "");
    scale.tune(650, 36);
    scale.set(1 + 5 / Math.max(card.offsetWidth, card.offsetHeight, 200));
    highlight(rowAt(event.clientX, event.clientY));
  };
  const move = (event: PointerEvent) => {
    pointerInside = true;
    if (!gesture) {
      const row = event.pointerType === "mouse" ? rowAt(event.clientX, event.clientY) : null;
      if (row) highlight(row);
      return;
    }
    if (event.pointerId !== gesture.id) return;
    const row = rowAt(event.clientX, event.clientY);
    if (row) highlight(row);
    x.set(resistance(event.clientX - gesture.x), true);
    y.set(resistance(event.clientY - gesture.y), true);
  };
  const end = (event: PointerEvent) => {
    if (event.pointerId !== gesture?.id) return;
    const chosen = event.type === "pointerup" ? rowAt(event.clientX, event.clientY) : null;
    highlight(null);
    gesture = null;
    card.removeAttribute("data-pressed");
    // Return without a second bounce, including while a child title moves back.
    scale.tune(650, 2 * Math.sqrt(650));
    x.tune(600, 2 * Math.sqrt(600));
    y.tune(600, 2 * Math.sqrt(600));
    scale.set(1);
    x.set(0);
    y.set(0);
    suppressClickUntil = performance.now() + 500;
    chosen?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      }),
    );
  };
  const leave = (event: PointerEvent) => {
    pointerInside = false;
    if (!gesture && event.pointerType === "mouse") highlight(null);
  };
  const click = (event: MouseEvent) => {
    if (event.detail !== 0 && performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  const key = () => {
    pointerInside = false;
    queueMicrotask(syncHighlight);
  };
  const elastic = new MutationObserver(() => {
    if (card.getAttribute("data-menu-elastic") !== "false") return;
    const old = gesture;
    gesture = null;
    if (old && card.hasPointerCapture(old.id)) card.releasePointerCapture(old.id);
    card.removeAttribute("data-pressed");
    scale.set(1, true);
    x.set(0, true);
    y.set(0, true);
  });
  elastic.observe(card, { attributes: true, attributeFilter: ["data-menu-elastic"] });
  card.addEventListener("pointerdown", down);
  card.addEventListener("pointermove", move);
  card.addEventListener("pointerleave", leave);
  card.addEventListener("pointerup", end);
  card.addEventListener("pointercancel", end);
  card.addEventListener("lostpointercapture", end);
  card.addEventListener("click", click, true);
  card.addEventListener("keydown", key);
  return () => {
    native?.destroy();
    highlights.disconnect();
    elastic.disconnect();
    [scale, x, y].forEach((spring) => spring.stop());
    card.removeAttribute("data-menu-plate-active");
    card.removeAttribute("data-scrubbing");
    card.removeAttribute("data-pressed");
    plate.style.opacity = "0";
    if (gesture && card.hasPointerCapture(gesture.id)) card.releasePointerCapture(gesture.id);
    for (const name of ["--lg-menu-origin", "--lg-menu-scale", "--lg-menu-translate"])
      card.style.removeProperty(name);
    card.removeEventListener("pointerdown", down);
    card.removeEventListener("pointermove", move);
    card.removeEventListener("pointerleave", leave);
    card.removeEventListener("pointerup", end);
    card.removeEventListener("pointercancel", end);
    card.removeEventListener("lostpointercapture", end);
    card.removeEventListener("click", click, true);
    card.removeEventListener("keydown", key);
  };
}
