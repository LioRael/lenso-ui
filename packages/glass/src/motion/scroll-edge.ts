/** Overlapping blur bands, ordered from the clear edge toward the bar. */
export const softEdgeBands = [
  { radius: 0.2125, start: 12.5, end: 100 },
  { radius: 0.425, start: 7.5, end: 95 },
  { radius: 0.85, start: 5, end: 92.5 },
  { radius: 1.7, start: 2.5, end: 90 },
  { radius: 3.4, start: 0, end: 87.5 },
  // A separate bar shoulder strengthens the top without softening the middle.
  { radius: 4.2, start: 0, end: 25 },
].map(({ radius, start, end }, index, levels) => {
  // Successive filters sample earlier bands: Gaussian variances, not radii, add.
  const previous = levels[index - 1]?.radius ?? 0;
  return {
    blur: Math.sqrt(radius ** 2 - previous ** 2),
    mask: softEdgeMask(start, end),
    start,
    end,
  };
});

export function createSoftEdgeTintMask(fadeStart = 0) {
  return softEdgeMask(0, 100, 1.35, fadeStart);
}
export const softEdgeTintMask = createSoftEdgeTintMask();

/** Raised-cosine falloff has zero slope at both ends of each band. */
export function softEdgeMask(start = 0, end = 100, power = 1, fadeStart = 0) {
  const stops = Array.from({ length: 17 }, (_, index) => {
    const t = index / 16;
    const alpha = ((1 + Math.cos(Math.PI * t)) / 2) ** power;
    const position = start + (end - start) * t;
    const stop =
      fadeStart === 0
        ? `${position}%`
        : `calc(${fadeStart}px + (100% - ${fadeStart}px) * ${position / 100})`;
    return `rgb(0 0 0 / ${alpha.toFixed(5)}) ${stop}`;
  });
  const prefix = fadeStart ? "rgb(0 0 0 / 1) 0px, " : "";
  return `linear-gradient(var(--material-edge-direction), ${prefix}${stops.join(", ")})`;
}

export type ScrollEdgeSide = "top" | "bottom" | "inline-start" | "inline-end";

export function bindScrollEdge(root: HTMLElement, scroll: HTMLElement, edge: ScrollEdgeSide) {
  let frame = 0;
  let previous = "";
  const measure = () => {
    frame = 0;
    const vertical = edge === "top" || edge === "bottom";
    const maximum = Math.max(
      0,
      vertical
        ? scroll.scrollHeight - scroll.clientHeight
        : scroll.scrollWidth - scroll.clientWidth,
    );
    // Modern engines use negative scrollLeft from the RTL inline start.
    const position = Math.min(
      maximum,
      Math.max(0, vertical ? scroll.scrollTop : Math.abs(scroll.scrollLeft)),
    );
    const distance = edge === "top" || edge === "inline-start" ? position : maximum - position;
    const extent = vertical ? root.clientHeight : root.clientWidth;
    const progress =
      maximum <= 1 ? 0 : Math.min(1, distance / Math.max(1, Math.min(24, extent * 0.4)));
    const value = progress.toFixed(3);
    if (value === previous) return;
    previous = value;
    root.style.setProperty("--material-edge-visibility", value);
    root.toggleAttribute("data-scroll-active", progress > 0.001);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(measure);
  };
  const resize = new ResizeObserver(schedule);
  const observed = new Set<Element>();
  const observe = () => {
    const next = new Set([scroll, root, ...scroll.children]);
    for (const node of observed) {
      if (!next.has(node)) {
        resize.unobserve(node);
        observed.delete(node);
      }
    }
    for (const node of next) {
      if (!observed.has(node)) {
        resize.observe(node);
        observed.add(node);
      }
    }
  };
  const mutation = new MutationObserver(() => {
    observe();
    schedule();
  });
  mutation.observe(scroll, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "style", "dir"],
  });
  observe();
  measure();
  const scrollEvents =
    scroll === scroll.ownerDocument.scrollingElement ? scroll.ownerDocument : scroll;
  scrollEvents.addEventListener("scroll", schedule, { passive: true });
  scroll.addEventListener("load", schedule, true);
  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    mutation.disconnect();
    scrollEvents.removeEventListener("scroll", schedule);
    scroll.removeEventListener("load", schedule, true);
    root.style.removeProperty("--material-edge-visibility");
    root.removeAttribute("data-scroll-active");
  };
}
