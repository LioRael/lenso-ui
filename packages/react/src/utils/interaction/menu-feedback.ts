// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Shared root/submenu feedback; native Menu owns focus and activation.
import { createSpring } from "@lenso/glass/motion";
const resistance = (value: number) =>
  Math.sign(value) * 7 * (1 - Math.exp((-Math.abs(value) * 0.12) / 7));

export function presentMenuFeedback(card: HTMLElement, family: "menu" | "select" = "menu") {
  const content = card.querySelector<HTMLElement>(
    family === "select" ? "[data-select-content]" : '[data-slot="menu-content"]',
  )!;
  const plate = card.querySelector<HTMLElement>(`[data-slot="${family}-plate"]`)!;
  const popupSelector = `[data-slot="${family === "select" ? "select-popover" : "menu-popup"}"]`;
  const offset = { scale: 1, x: 0, y: 0 };
  const paint = () => {
    card.style.setProperty("--lg-menu-scale", String(offset.scale));
    card.style.setProperty("--lg-menu-translate", `${offset.x}px ${offset.y}px`);
  };
  const scale = createSpring(1, 650, 36, (value) => {
    offset.scale = value;
    paint();
  });
  const x = createSpring(0, 600, 30, (value) => {
    offset.x = value;
    paint();
  });
  const y = createSpring(0, 600, 30, (value) => {
    offset.y = value;
    paint();
  });
  let gesture: { id: number; x: number; y: number; scrubbing: boolean } | null = null;
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
    card.setAttribute("data-scrubbing", "");
    plate.style.width = `${row.offsetWidth}px`;
    plate.style.height = `${row.offsetHeight}px`;
    const rowStyle = getComputedStyle(row);
    plate.style.borderRadius = rowStyle.borderRadius;
    plate.style.backgroundColor = rowStyle.getPropertyValue("--lenso-menu-highlight");
    if (first) plate.style.transition = "none";
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
    suppressClickUntil = 0;
    if (
      card.getAttribute("data-menu-elastic") === "false" ||
      !event.isPrimary ||
      event.button !== 0 ||
      event.defaultPrevented ||
      !card.hasAttribute("data-open")
    )
      return;
    const row = rowAt(event.clientX, event.clientY);
    if (!row || !(event.target instanceof Element) || !row.contains(event.target)) return;
    const control = event.target.closest(
      "button, input, textarea, select, a[href], [contenteditable]",
    );
    if (control && control !== row && row.contains(control)) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, scrubbing: false };
    card.setAttribute("data-pressed", "");
    scale.set(1 + 5 / Math.max(card.offsetWidth, card.offsetHeight, 200));
    highlight(row);
  };
  const move = (event: PointerEvent) => {
    pointerInside = true;
    if (!gesture) {
      const row = event.pointerType === "mouse" ? rowAt(event.clientX, event.clientY) : null;
      if (row) highlight(row);
      return;
    }
    if (event.pointerId !== gesture.id) return;
    if (!gesture.scrubbing) {
      if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) < 4) return;
      gesture.scrubbing = true;
      card.setPointerCapture(event.pointerId);
    }
    const row = rowAt(event.clientX, event.clientY);
    if (row) highlight(row);
    x.set(resistance(event.clientX - gesture.x), true);
    y.set(resistance(event.clientY - gesture.y), true);
  };
  const end = (event: PointerEvent) => {
    if (event.pointerId !== gesture?.id) return;
    const scrubbed = gesture.scrubbing && event.type === "pointerup";
    const chosen = scrubbed ? rowAt(event.clientX, event.clientY) : null;
    highlight(null);
    gesture = null;
    card.removeAttribute("data-pressed");
    scale.set(1);
    x.set(0);
    y.set(0);
    if (scrubbed) {
      suppressClickUntil = performance.now() + 500;
      chosen?.click();
    }
  };
  const leave = (event: PointerEvent) => {
    pointerInside = false;
    if (gesture && !gesture.scrubbing) end(event);
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
