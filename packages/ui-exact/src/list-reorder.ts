const selector = '[data-slot="list-reorder"]';
export function connectListReorder(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLButtonElement) || data["lensoKind"] !== "list-reorder") return;
  const root = node.closest<HTMLElement>("[data-lenso-active]");
  if (!root) return;
  const group = node.closest('[role="list"]');
  const owner = node.parentElement!;
  const announcement = owner.querySelector<HTMLElement>('[data-slot="list-reorder-status"]');
  const items = () =>
    [...root.querySelectorAll<HTMLButtonElement>(selector)].filter(
      (n) =>
        !n.disabled &&
        n.closest("[data-lenso-active]") === root &&
        n.closest('[role="list"]') === group,
    );
  let target: HTMLButtonElement | undefined,
    active = false;
  let pointer:
    | {
        id: number;
        startY: number;
        y: number;
        scroll: HTMLElement;
        startScroll: number;
        maxScroll: number;
        moved: boolean;
      }
    | undefined;
  let pointerPosition: "before" | "after" | undefined;
  let frame = 0;
  const source = node.closest<HTMLElement>('[data-slot="list-item"]');
  const saved = new Map<HTMLElement, Map<string, [string, string]>>();
  const paint = (element: HTMLElement, property: string, value: string) => {
    let values = saved.get(element);
    if (!values) saved.set(element, (values = new Map()));
    if (!values.has(property))
      values.set(property, [
        element.style.getPropertyValue(property),
        element.style.getPropertyPriority(property),
      ]);
    element.style.setProperty(property, value);
  };
  const restore = () => {
    for (const [element, values] of saved)
      for (const [property, [value, priority]] of values) {
        if (value) element.style.setProperty(property, value, priority);
        else element.style.removeProperty(property);
      }
    saved.clear();
  };
  const oldPressed = node.getAttribute("aria-pressed");
  const announce = (text: string) => {
    if (announcement) announcement.textContent = text;
  };
  const reset = (message: string) => {
    active = false;
    const previous = pointer;
    pointer = undefined;
    pointerPosition = undefined;
    cancelAnimationFrame(frame);
    frame = 0;
    if (previous && node.hasPointerCapture(previous.id)) node.releasePointerCapture(previous.id);
    restore();
    target = undefined;
    node.setAttribute("aria-pressed", "false");
    announce(message);
  };
  const enabled = () =>
    !node.disabled &&
    root.dataset["lensoActive"] === "true" &&
    root.dataset["lensoDisabled"] !== "true";
  const activate = () => {
    if (!enabled()) return;
    if (!active) {
      active = true;
      node.setAttribute("aria-pressed", "true");
      announce("Move started. Use Up or Down, Enter to place, Escape to cancel.");
      return;
    }
    if (target?.isConnected && !target.disabled) {
      const live = items();
      const position =
        pointerPosition ?? (live.indexOf(target) < live.indexOf(node) ? "before" : "after");
      const bridge = owner.querySelector<HTMLInputElement>(
        `[data-slot="list-reorder-${position}"]`,
      );
      const key = target.dataset["lensoValue"];
      if (bridge && key !== undefined) {
        const name = target.getAttribute("aria-label") ?? "item";
        reset(`Move requested ${position} ${name}.`);
        bridge.value = key;
        bridge.dispatchEvent(new Event("input", { bubbles: true }));
        queueMicrotask(() => {
          const handle = node.isConnected ? node : node.ownerDocument.getElementById(node.id);
          if (handle instanceof HTMLButtonElement && !handle.disabled) handle.focus();
        });
        return;
      }
    }
    reset("Order unchanged.");
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && active) {
      event.preventDefault();
      reset("Move cancelled.");
      return;
    }
    if (!enabled()) return;
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      activate();
      return;
    }
    if (pointer || !active || !["ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const live = items();
    const current = target ?? node;
    const index = live.indexOf(current);
    const next =
      live[Math.max(0, Math.min(live.length - 1, index + (event.key === "ArrowUp" ? -1 : 1)))];
    target = next === node ? undefined : next;
    if (target) {
      target.scrollIntoView({ block: "nearest" });
      announce(
        `Place ${live.indexOf(target) < live.indexOf(node) ? "before" : "after"} ${target.getAttribute("aria-label") ?? "item"}. Press Enter to confirm.`,
      );
    } else announce("Original position.");
  };
  const updatePointer = () => {
    if (!pointer || !source || !pointer.moved) return;
    restore();
    const candidates = items()
      .filter((n) => n !== node)
      .map((handle) => {
        const row = handle.closest<HTMLElement>('[data-slot="list-item"]')!;
        const rect = row.getBoundingClientRect();
        return { handle, row, rect, distance: Math.abs(pointer!.y - rect.top - rect.height / 2) };
      })
      .sort((a, b) => a.distance - b.distance);
    const nearest = candidates[0];
    target = nearest?.handle;
    pointerPosition = nearest
      ? pointer.y < nearest.rect.top + nearest.rect.height / 2
        ? "before"
        : "after"
      : undefined;
    const base = getComputedStyle(source).transform;
    paint(
      source,
      "transform",
      `${base === "none" ? "" : base} translateY(${pointer.y - pointer.startY + pointer.scroll.scrollTop - pointer.startScroll}px)`,
    );
    paint(
      source,
      "background-color",
      "var(--lenso-list-surface, var(--lenso-background-grouped-secondary))",
    );
    paint(source, "z-index", "4");
    paint(source, "box-shadow", "0 4px 18px rgb(0 0 0 / .15)");
    paint(source, "border-radius", "16px");
    if (nearest)
      paint(
        nearest.row,
        "box-shadow",
        `inset 0 ${pointerPosition === "before" ? 2 : -2}px 0 var(--lenso-tint)`,
      );
  };
  const autoScroll = () => {
    frame = 0;
    if (!pointer || !pointer.moved) return;
    const scroll = pointer.scroll;
    const rect =
      scroll === node.ownerDocument.scrollingElement
        ? { top: 0, bottom: node.ownerDocument.defaultView!.innerHeight }
        : scroll.getBoundingClientRect();
    const delta = pointer.y < rect.top + 36 ? -12 : pointer.y > rect.bottom - 36 ? 12 : 0;
    const previous = scroll.scrollTop;
    scroll.scrollTop = Math.max(0, Math.min(pointer.maxScroll, previous + delta));
    if (previous !== scroll.scrollTop) updatePointer();
    if (delta && previous !== scroll.scrollTop) frame = requestAnimationFrame(autoScroll);
  };
  const down = (event: PointerEvent) => {
    if (
      event.defaultPrevented ||
      !event.isPrimary ||
      event.button !== 0 ||
      !enabled() ||
      active ||
      !source
    )
      return;
    event.preventDefault();
    node.focus({ preventScroll: true });
    let scroll = source.parentElement;
    while (
      scroll &&
      !(
        /auto|scroll/.test(getComputedStyle(scroll).overflowY) &&
        scroll.scrollHeight > scroll.clientHeight
      )
    )
      scroll = scroll.parentElement;
    scroll ??= node.ownerDocument.scrollingElement as HTMLElement;
    pointer = {
      id: event.pointerId,
      startY: event.clientY,
      y: event.clientY,
      scroll,
      startScroll: scroll.scrollTop,
      maxScroll: scroll.scrollHeight - scroll.clientHeight,
      moved: false,
    };
    active = true;
    node.setAttribute("aria-pressed", "true");
    node.setPointerCapture(event.pointerId);
    announce("Moving item. Release to place, Escape to cancel.");
  };
  const move = (event: PointerEvent) => {
    if (pointer?.id !== event.pointerId) return;
    pointer.y = event.clientY;
    pointer.moved ||= Math.abs(pointer.y - pointer.startY) >= 4;
    updatePointer();
    if (!frame) frame = requestAnimationFrame(autoScroll);
  };
  const up = (event: PointerEvent) => {
    if (pointer?.id !== event.pointerId) return;
    if (event.defaultPrevented || !pointer.moved) reset("Order unchanged.");
    else activate();
  };
  const cancel = (event: PointerEvent) => {
    if (pointer?.id === event.pointerId) reset("Move cancelled.");
  };
  const click = (event: MouseEvent) => {
    if (!event.defaultPrevented && event.detail === 0) activate();
  };
  const blur = () => {
    if (active) reset("Move cancelled.");
  };
  const observer = new MutationObserver(() => {
    if (
      active &&
      (!enabled() || !node.isConnected || (target && (!target.isConnected || target.disabled)))
    )
      reset("Move cancelled.");
  });
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["disabled", "data-lenso-active", "data-lenso-disabled"],
  });
  node.addEventListener("pointerdown", down);
  node.addEventListener("pointermove", move);
  node.addEventListener("pointerup", up);
  node.addEventListener("pointercancel", cancel);
  node.addEventListener("lostpointercapture", cancel);
  node.addEventListener("keydown", keydown);
  node.addEventListener("click", click);
  node.addEventListener("blur", blur);
  return () => {
    observer.disconnect();
    reset("");
    node.removeEventListener("pointerdown", down);
    node.removeEventListener("pointermove", move);
    node.removeEventListener("pointerup", up);
    node.removeEventListener("pointercancel", cancel);
    node.removeEventListener("lostpointercapture", cancel);
    node.removeEventListener("keydown", keydown);
    node.removeEventListener("click", click);
    node.removeEventListener("blur", blur);
    if (oldPressed === null) node.removeAttribute("aria-pressed");
    else node.setAttribute("aria-pressed", oldPressed);
    if (announcement) announcement.textContent = "";
  };
}
