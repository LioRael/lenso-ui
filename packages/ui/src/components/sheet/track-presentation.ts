import type { Drawer } from "@base-ui/react/drawer";
import { resolvePresentationPoints, sheetPresentationAt } from "./presentation.js";

const registeredClocks = new WeakSet<object>();

export function registerSheetClock(css: Pick<typeof CSS, "registerProperty"> | undefined) {
  if (!css?.registerProperty) return false;
  if (registeredClocks.has(css)) return true;
  try {
    css.registerProperty({
      name: "--lenso-sheet-position",
      syntax: "<length>",
      inherits: true,
      initialValue: "0px",
    });
  } catch (error) {
    if (
      !error ||
      typeof error !== "object" ||
      !("name" in error) ||
      error.name !== "InvalidModificationError"
    )
      throw error;
  }
  registeredClocks.add(css);
  return true;
}

export function trackSheetPresentation(
  popup: HTMLElement,
  surface: HTMLElement,
  viewport: HTMLElement,
  presentation: {
    snapPoints: readonly Drawer.Root.SnapPoint[];
    attached: readonly Drawer.Root.SnapPoint[];
  },
) {
  const view = popup.ownerDocument.defaultView!;
  if (registerSheetClock(view.CSS)) {
    popup.style.setProperty("--sheet-popup-height", `${popup.offsetHeight}px`);
    popup.setAttribute("data-sheet-clock", "");
  }
  let points: ReturnType<typeof resolvePresentationPoints> = [];
  let frame = 0;
  let opening = popup.hasAttribute("data-starting-style");
  let disposed = false;
  const write = (name: string, value: string) => {
    if (surface.style.getPropertyValue(name) !== value) surface.style.setProperty(name, value);
  };
  const sample = () => {
    frame = 0;
    if (disposed) return;
    const css = view.getComputedStyle(popup);
    const offset = Number.parseFloat(css.getPropertyValue("--drawer-snap-point-offset")) || 0;
    const movement = Number.parseFloat(css.getPropertyValue("--drawer-swipe-movement-y")) || 0;
    const nesting = Number.parseFloat(css.getPropertyValue("--sheet-nesting-offset")) || 0;
    const target = offset + movement;
    const transform = css.transform;
    const translation =
      transform && transform !== "none"
        ? new view.DOMMatrixReadOnly(transform).m42 - nesting
        : target;
    const swiping = popup.hasAttribute("data-swiping");
    const ending = popup.hasAttribute("data-ending-style");
    const starting = popup.hasAttribute("data-starting-style");
    const arrived = Math.abs(translation - target) < 0.1;
    if (swiping || (!starting && arrived)) opening = false;
    if (ending) opening = true;
    popup.toggleAttribute("data-sheet-entering", opening && !ending);
    // The browser clock drives both transform and visible height. Sampling
    // that position also visits intermediate shapes when a snap skips a detent.
    const position = opening || ending || (arrived && !swiping) ? target : translation;
    const { floating, solid } = sheetPresentationAt(points, popup.offsetHeight - position);
    write("--sheet-presentation-offset", `${position}px`);
    write("--sheet-edge-inset", `${floating * 6}px`);
    write("--sheet-bottom-radius", `${floating * 58}px`);
    write("--sheet-solid-opacity", String(solid));
    if (!ending && (swiping || starting || !arrived)) frame = view.requestAnimationFrame(sample);
  };
  const schedule = () => {
    if (!frame && !disposed) frame = view.requestAnimationFrame(sample);
  };
  const measure = () => {
    popup.style.setProperty("--sheet-popup-height", `${popup.offsetHeight}px`);
    points = resolvePresentationPoints(
      presentation.snapPoints,
      presentation.attached,
      viewport.offsetHeight,
      popup.offsetHeight,
      Number.parseFloat(view.getComputedStyle(popup.ownerDocument.documentElement).fontSize) || 16,
    );
    if (frame) view.cancelAnimationFrame(frame);
    sample();
  };
  measure();
  const movementObserver = new MutationObserver((records) => {
    if (records.some((record) => record.attributeName === "data-starting-style")) opening = true;
    schedule();
  });
  movementObserver.observe(popup, {
    attributes: true,
    attributeFilter: ["style", "data-swiping", "data-starting-style", "data-ending-style"],
  });
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(viewport);
  resizeObserver.observe(popup);
  return () => {
    disposed = true;
    movementObserver.disconnect();
    resizeObserver.disconnect();
    if (frame) view.cancelAnimationFrame(frame);
    popup.removeAttribute("data-sheet-clock");
    popup.removeAttribute("data-sheet-entering");
    popup.style.removeProperty("--sheet-popup-height");
    for (const name of [
      "--sheet-presentation-offset",
      "--sheet-edge-inset",
      "--sheet-bottom-radius",
      "--sheet-solid-opacity",
    ])
      surface.style.removeProperty(name);
  };
}
