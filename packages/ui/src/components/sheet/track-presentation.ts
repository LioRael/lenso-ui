import type { SnapPoint } from "@ui-sdk/react/drawer";
import { resolvePresentationPoints, sheetPresentationAt } from "./presentation.js";

export function trackSheetPresentation(
  popup: HTMLElement,
  surface: HTMLElement,
  viewport: HTMLElement,
  presentation: { snapPoints: readonly SnapPoint[]; attached: readonly SnapPoint[] },
) {
  const view = popup.ownerDocument.defaultView!;
  let points: ReturnType<typeof resolvePresentationPoints> = [];
  let frame = 0;
  let disposed = false;
  let opening = true;
  const write = (name: string, value: string) => {
    if (surface.style.getPropertyValue(name) !== value) surface.style.setProperty(name, value);
  };
  const sample = () => {
    frame = 0;
    if (disposed) return;
    const css = view.getComputedStyle(popup);
    const progress = Number.parseFloat(css.getPropertyValue("--drawer-progress"));
    const target = presentation.snapPoints.find(
      (point) => String(point) === popup.getAttribute("data-snap-point"),
    );
    const transitioning =
      popup.hasAttribute("data-starting-style") || popup.hasAttribute("data-ending-style");
    const targetHeight =
      target === undefined
        ? undefined
        : resolvePresentationPoints(
            [target],
            [],
            viewport.offsetHeight,
            popup.offsetHeight,
            Number.parseFloat(
              view.getComputedStyle(popup.ownerDocument.documentElement).fontSize,
            ) || 16,
          )[0]?.height;
    const progressHeight =
      (Number.isFinite(progress) ? progress : 1) * (points.at(-1)?.height ?? popup.offsetHeight);
    // Native progress can reach its target before the compositor's translate does.
    const translation = Number.parseFloat(css.translate?.split(/\s+/)[1] ?? "");
    const actualHeight =
      popup.getAttribute("data-driver") !== "scroll-snap" && Number.isFinite(translation)
        ? popup.offsetHeight - translation
        : progressHeight;
    const dragging = popup.hasAttribute("data-dragging");
    const arrived = Math.abs(actualHeight - (targetHeight ?? progressHeight)) < 0.1;
    if (dragging || (!transitioning && targetHeight !== undefined && arrived)) opening = false;
    const height =
      (opening || transitioning || arrived) && targetHeight !== undefined
        ? targetHeight
        : actualHeight;
    const { floating, solid } = sheetPresentationAt(points, height);
    write("--sheet-presentation-offset", `${popup.offsetHeight - height}px`);
    write("--sheet-edge-inset", `${floating * 6}px`);
    write("--sheet-bottom-radius", `${floating * 58}px`);
    write("--sheet-solid-opacity", String(solid));
    if (!popup.hasAttribute("data-ending-style") && (dragging || !arrived))
      frame = view.requestAnimationFrame(sample);
  };
  const measure = () => {
    if (frame) view.cancelAnimationFrame(frame);
    points = resolvePresentationPoints(
      presentation.snapPoints,
      presentation.attached,
      viewport.offsetHeight,
      popup.offsetHeight,
      Number.parseFloat(view.getComputedStyle(popup.ownerDocument.documentElement).fontSize) || 16,
    );
    sample();
  };
  measure();
  const schedule = () => {
    if (!frame && !disposed) frame = view.requestAnimationFrame(sample);
  };
  viewport.addEventListener("scroll", schedule, { capture: true, passive: true });
  const movementObserver = new MutationObserver((records) => {
    if (
      records.some(
        (record) =>
          record.attributeName === "data-starting-style" &&
          popup.hasAttribute("data-starting-style"),
      )
    )
      opening = true;
    schedule();
  });
  movementObserver.observe(popup, {
    attributes: true,
    attributeFilter: [
      "style",
      "data-snap-point",
      "data-starting-style",
      "data-ending-style",
      "data-dragging",
    ],
  });
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(viewport);
  resizeObserver.observe(popup);
  return () => {
    disposed = true;
    movementObserver.disconnect();
    viewport.removeEventListener("scroll", schedule, true);
    resizeObserver.disconnect();
    if (frame) view.cancelAnimationFrame(frame);
    for (const name of [
      "--sheet-presentation-offset",
      "--sheet-edge-inset",
      "--sheet-bottom-radius",
      "--sheet-solid-opacity",
    ])
      surface.style.removeProperty(name);
  };
}
