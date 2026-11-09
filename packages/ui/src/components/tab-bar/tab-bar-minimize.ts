import { useLayoutEffect, useRef, type RefObject } from "react";
import { createSpring, type Spring } from "@lenso/glass/motion";

/** Keep the expanded row intact while the material and selected destination converge. */
export function useTabBarMinimize(
  ref: RefObject<HTMLDivElement | null>,
  minimized: boolean,
  separate: boolean,
  layout: "phone" | "tablet",
) {
  const motion = useRef<Spring | null>(null);
  useLayoutEffect(() => {
    const group = ref.current;
    const root = group?.parentElement;
    const list = group?.querySelector<HTMLElement>("[data-tab-bar-list]");
    if (!group || !root || !list) return;
    let progress = group.hasAttribute("data-minimized") ? 1 : 0;
    let expandedWidth = 0;
    let selectedShift = 0;
    const material = group.querySelector<HTMLElement>(":scope > [data-material]");
    const expandedHeight = layout === "phone" ? 54 : 44;
    group.setAttribute("data-minimize-ready", "");
    const paint = (value: number) => {
      progress = value;
      const width = expandedWidth + (44 - expandedWidth) * progress;
      group.style.setProperty("--tab-bar-flex", `0 1 ${width}px`);
      group.style.setProperty("--tab-bar-width", `${width}px`);
      group.style.setProperty(
        "--tab-bar-height",
        `${expandedHeight + (44 - expandedHeight) * progress}px`,
      );
      group.style.setProperty("--tab-bar-collapse", String(progress));
      group.style.setProperty("--tab-bar-content-opacity", String(Math.max(0, 1 - 3 * progress)));
      group.toggleAttribute("data-minimize-moving", progress > 0);
      const settled = value === (group.hasAttribute("data-minimized") ? 1 : 0);
      group.toggleAttribute("data-tab-bar-resizing", !settled);
      material?.toggleAttribute("data-material-resting", settled);
      if (separate) group.style.setProperty("--tab-bar-expanded-width", `${width}px`);
    };
    const measure = () => {
      // Measure the normal flex layout, never an intermediate shrinking row.
      const siblings = [...root.children].filter(
        (node): node is HTMLElement => node instanceof HTMLElement && node !== group,
      );
      const saved = [group, ...siblings].map((node) => [node, node.style.cssText] as const);
      for (const [node] of saved) {
        node.style.removeProperty("--tab-bar-flex");
        node.style.removeProperty("--tab-bar-width");
        node.style.removeProperty("--tab-bar-expanded-width");
      }
      group.style.setProperty("--tab-bar-collapse", "0");
      group.style.removeProperty("--tab-bar-height");
      const scale = parseFloat(getComputedStyle(group).scale) || 1;
      expandedWidth = group.getBoundingClientRect().width / scale;
      const current = list.querySelector<HTMLElement>("[data-tab-bar-item][data-current]");
      if (current) {
        const content = current.querySelector<HTMLElement>("[data-tab-bar-content]") ?? current;
        const rect = content.getBoundingClientRect();
        const origin = list.getBoundingClientRect();
        selectedShift = 22 - (rect.left - origin.left + rect.width / 2) / scale;
      } else selectedShift = 0;
      for (const [node, style] of saved) node.style.cssText = style;
      group.style.setProperty("--tab-bar-expanded-width", `${expandedWidth}px`);
      group.style.setProperty("--tab-bar-selected-shift", `${selectedShift}px`);
      paint(progress);
    };
    measure();
    const spring = createSpring(progress, 400, 40, paint);
    motion.current = spring;
    let rootWidth: number | undefined;
    const resize = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const width = entry.contentRect.width;
      const changed = rootWidth === undefined || Math.abs(width - rootWidth) > 0.1;
      rootWidth = width;
      if (changed) measure();
    });
    resize.observe(root);
    const mutation = new MutationObserver(measure);
    mutation.observe(list, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["data-current"],
    });
    const groups = new MutationObserver(measure);
    groups.observe(root, { childList: true });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => {
      if (reduced.matches) spring.set(group.hasAttribute("data-minimized") ? 1 : 0, true);
    };
    reduced.addEventListener("change", finish);
    return () => {
      spring.stop();
      motion.current = null;
      resize.disconnect();
      mutation.disconnect();
      groups.disconnect();
      group.removeAttribute("data-minimize-moving");
      group.removeAttribute("data-minimize-ready");
      group.removeAttribute("data-tab-bar-resizing");
      material?.setAttribute("data-material-resting", "");
      reduced.removeEventListener("change", finish);
      for (const name of [
        "--tab-bar-flex",
        "--tab-bar-width",
        "--tab-bar-height",
        "--tab-bar-collapse",
        "--tab-bar-content-opacity",
        "--tab-bar-expanded-width",
        "--tab-bar-selected-shift",
      ])
        group.style.removeProperty(name);
    };
    // The spring survives direction changes so reversals retain position and velocity.
  }, [ref, separate, layout]);
  useLayoutEffect(() => {
    const group = ref.current;
    if (
      group &&
      Number(group.style.getPropertyValue("--tab-bar-collapse")) !== (minimized ? 1 : 0)
    ) {
      group.setAttribute("data-tab-bar-resizing", "");
      group.querySelector(":scope > [data-material]")?.removeAttribute("data-material-resting");
    }
    motion.current?.set(minimized ? 1 : 0);
  }, [ref, minimized]);
}
