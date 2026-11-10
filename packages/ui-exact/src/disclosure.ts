interface Panel {
  update(open: boolean, animate?: boolean): void;
  destroy(): void;
}

const panels = new WeakMap<HTMLElement, Panel>();

function createPanel(node: HTMLElement): Panel {
  const measure = node.querySelector<HTMLElement>(":scope > [data-lenso-panel-measure]");
  if (!measure) throw new Error("Lenso collapsible panel is missing its measurement body");
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const properties = ["height", "opacity", "transition-property"];
  const originals = properties.map(
    (property) =>
      [
        property,
        node.style.getPropertyValue(property),
        node.style.getPropertyPriority(property),
      ] as const,
  );
  let animations: Animation[] = [];
  let expanded = node.dataset["lensoOpen"] === "true";
  let height = 0;
  let opacity = expanded ? 1 : 0;

  const update = (open: boolean, animate = true) => {
    const style = getComputedStyle(node);
    const active = animations.some((animation) => animation.playState === "running");
    const fromHeight = active ? parseFloat(style.height) : height;
    const fromOpacity = active ? Number(style.opacity) : opacity;
    const natural = parseFloat(getComputedStyle(measure).height) || 0;
    const nextHeight = open ? natural : 0;
    const nextOpacity = open ? 1 : 0;
    if (animate && open === expanded && Math.abs(nextHeight - height) < 0.1) return;
    if (!open && node.contains(document.activeElement))
      document.getElementById(node.dataset["lensoTrigger"] ?? "")?.focus();
    for (const animation of animations) animation.cancel();
    animations = [];
    // Exact commits state first. Animate from our previous target, or the live
    // animation value on reversal, rather than the just-committed auto/zero row.
    node.style.transitionProperty = "none";
    node.style.height = `${nextHeight}px`;
    node.style.opacity = String(nextOpacity);
    expanded = open;
    height = nextHeight;
    opacity = nextOpacity;
    const time = style.transitionDuration.split(",")[0]?.trim() ?? "0s";
    const duration = parseFloat(time) * (time.endsWith("ms") ? 1 : 1000);
    if (!animate || media.matches || !duration) return;
    const easings =
      style.transitionTimingFunction.match(/(?:cubic-bezier|steps)\([^)]*\)|[^,\s]+/g) ?? [];
    if (Math.abs(nextHeight - fromHeight) > 0.1)
      animations.push(
        node.animate(
          { height: [`${fromHeight}px`, `${nextHeight}px`] },
          { duration, easing: easings[0] ?? "ease-out" },
        ),
      );
    if (Math.abs(nextOpacity - fromOpacity) > 0.01)
      animations.push(
        node.animate(
          { opacity: [fromOpacity, nextOpacity] },
          { duration, easing: easings[1] ?? easings[0] ?? "ease-out" },
        ),
      );
  };
  update(expanded, false);
  const observer = new ResizeObserver(() =>
    update(
      expanded,
      animations.some((animation) => animation.playState === "running"),
    ),
  );
  observer.observe(measure);
  const settle = () => {
    if (media.matches) update(expanded, false);
  };
  media.addEventListener("change", settle);
  return {
    update,
    destroy() {
      observer.disconnect();
      media.removeEventListener("change", settle);
      for (const animation of animations) animation.cancel();
      for (const [property, value, priority] of originals)
        if (value) node.style.setProperty(property, value, priority);
        else node.style.removeProperty(property);
    },
  };
}

export function updatePanel(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (data["lensoKind"] !== "disclosure-content" && data["lensoKind"] !== "accordion-panel") {
    endPanel(node);
    return;
  }
  const panel = panels.get(node);
  if (panel) panel.update(data["lensoOpen"] === "true");
  else panels.set(node, createPanel(node));
}

export function endPanel(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  panels.get(node)?.destroy();
  panels.delete(node);
}

// Adapted from Lenso's React accordion keyboard helper; Exact owns activation.
export function connectAccordion(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (data["lensoKind"] !== "accordion" || !(node instanceof HTMLElement)) return;
  const navigate = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const target = event.target;
    if (!(target instanceof Element) || target.closest('[data-slot="accordion"]') !== node) return;
    const trigger = target.closest('[data-slot="accordion-trigger"]');
    if (!(trigger instanceof HTMLButtonElement)) return;
    const items = [
      ...node.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]'),
    ].filter((item) => item.closest('[data-slot="accordion"]') === node && !item.disabled);
    const index = items.indexOf(trigger);
    if (index === -1) return;
    const rtl = getComputedStyle(node).direction === "rtl";
    const vertical = data["orientation"] === "vertical";
    const previous = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    let destination: number;
    if (event.key === "Home") destination = 0;
    else if (event.key === "End") destination = items.length - 1;
    else if (event.key === previous || event.key === next) {
      destination = index + (event.key === next ? 1 : -1);
      destination =
        data["lensoLoopFocus"] === "true"
          ? (destination + items.length) % items.length
          : Math.max(0, Math.min(items.length - 1, destination));
    } else return;
    event.preventDefault();
    items[destination]?.focus();
  };
  node.addEventListener("keydown", navigate);
  return () => node.removeEventListener("keydown", navigate);
}
