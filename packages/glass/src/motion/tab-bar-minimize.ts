import { createSpring } from "./spring.js";

export function bindTabBarMinimize(
  group: HTMLDivElement,
  separate: boolean,
  layout: "phone" | "tablet" | "vertical",
) {
  const vertical = layout === "vertical";
  if (vertical && separate) return;
  const root = group?.parentElement;
  const list = group?.querySelector<HTMLElement>("[data-tab-bar-list]");
  if (!group || !root || !list) return;
  let progress = group.hasAttribute("data-minimized") ? 1 : 0;
  let expandedWidth = 0;
  let selectedShift = 0;
  const material = group.querySelector<HTMLElement>(":scope > [data-material]");
  let expandedHeight = layout === "phone" ? 54 : 44;
  const compactHeight = vertical ? 48 : 44;
  group.setAttribute("data-minimize-ready", "");
  const paint = (value: number) => {
    progress = value;
    const width = expandedWidth + (44 - expandedWidth) * progress;
    if (!vertical) {
      group.style.setProperty("--tab-bar-flex", `0 1 ${width}px`);
      group.style.setProperty("--tab-bar-width", `${width}px`);
    }
    group.style.setProperty(
      "--tab-bar-height",
      `${expandedHeight + (compactHeight - expandedHeight) * progress}px`,
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
    if (vertical) {
      // The column keeps its natural height even when the glass has contracted.
      expandedHeight = list.offsetHeight;
      const current = list.querySelector<HTMLElement>("[data-tab-bar-item][data-current]");
      const row = current?.parentElement;
      const center = row ? row.offsetTop + row.offsetHeight / 2 : compactHeight / 2;
      group.style.setProperty("--tab-bar-selected-shift-y", `${compactHeight / 2 - center}px`);
      paint(progress);
      return;
    }
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
    group.style.setProperty("--tab-bar-selected-shift-x", `${selectedShift}px`);
    paint(progress);
  };
  measure();
  const spring = createSpring(progress, 400, 40, paint);
  let rootWidth: number | undefined;
  const resize = new ResizeObserver(([entry]) => {
    if (!entry) return;
    if (vertical) {
      measure();
      return;
    }
    const width = entry.contentRect.width;
    const changed = rootWidth === undefined || Math.abs(width - rootWidth) > 0.1;
    rootWidth = width;
    if (changed) measure();
  });
  resize.observe(vertical ? list : root);
  const mutation = new MutationObserver(measure);
  mutation.observe(list, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["data-current"],
  });
  const groups = new MutationObserver(measure);
  if (!vertical) groups.observe(root, { childList: true });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finish = () => {
    if (reduced.matches) spring.set(group.hasAttribute("data-minimized") ? 1 : 0, true);
  };
  reduced.addEventListener("change", finish);
  const destroy = () => {
    spring.stop();
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
      "--tab-bar-selected-shift-x",
      "--tab-bar-selected-shift-y",
    ])
      group.style.removeProperty(name);
  };
  return {
    destroy,
    setMinimized(minimized: boolean) {
      if (Number(group.style.getPropertyValue("--tab-bar-collapse")) !== (minimized ? 1 : 0)) {
        group.setAttribute("data-tab-bar-resizing", "");
        material?.removeAttribute("data-material-resting");
      }
      spring.set(minimized ? 1 : 0);
    },
  };
}

export function restoreTabBarFocus(list: Element) {
  const enabled = '[data-tab-bar-item]:not([aria-disabled="true"]):not(:disabled)';
  const target =
    list.querySelector<HTMLElement>(enabled + "[data-current]") ??
    list.querySelector<HTMLElement>(enabled);
  if (!target) return;
  const document = target.ownerDocument;
  target.focus({ preventScroll: true });
  if (document.activeElement === target) return;

  // WebKit may still treat the list as inert during the commit that removes the attribute.
  const frame = requestAnimationFrame(() => {
    const active = document.activeElement;
    if (
      !target.isConnected ||
      list.hasAttribute("inert") ||
      (active !== document.body && !list.contains(active))
    )
      return;
    target.focus({ preventScroll: true });
  });
  return () => cancelAnimationFrame(frame);
}
