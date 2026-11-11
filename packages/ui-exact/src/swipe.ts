const controllers = new WeakMap<HTMLElement, () => void>();
export function updateSwipe(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches('[data-slot="swipe-actions"]')
    ? node
    : node.closest<HTMLElement>('[data-slot="swipe-actions"]');
  if (!root || controllers.has(root)) return;
  const content = root.querySelector<HTMLElement>('[data-slot="swipe-actions-content"]');
  const bridge = root.querySelector<HTMLInputElement>('[data-slot="swipe-request"]');
  if (!content || !bridge) return;
  const own = <T extends HTMLElement>(selector: string) =>
    [...root.querySelectorAll<T>(selector)].filter(
      (n) => n.closest('[data-slot="swipe-actions"]') === root,
    );
  const areas = () => own<HTMLElement>('[data-slot="swipe-actions-actions"]');
  const triggers = () => own<HTMLButtonElement>('[data-slot="swipe-trigger"]');
  const disabled = () => root.dataset["lensoDisabled"] === "true";
  const direction = () => (getComputedStyle(root).direction === "rtl" ? -1 : 1);
  const area = (edge: string) => areas().find((n) => n.dataset["lensoSide"] === edge);
  const width = (edge: string) => area(edge)?.offsetWidth ?? 0;
  const side = () => (disabled() ? "" : (root.dataset["lensoValue"] ?? ""));
  const request = (next: string) => {
    if (next === side()) return;
    const previous = side();
    const focus = previous && area(previous)?.contains(root.ownerDocument.activeElement);
    bridge.value = next;
    bridge.dispatchEvent(new Event("input", { bubbles: true }));
    if (focus && !next)
      queueMicrotask(() =>
        triggers()
          .find((n) => n.dataset["lensoSide"] === previous)
          ?.focus(),
      );
  };
  const styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const remember = (n: HTMLElement) => {
    if (styles.has(n)) return;
    const values = new Map<string, [string, string]>();
    for (const name of n === content ? ["transform", "transition-duration"] : ["visibility"])
      values.set(name, [n.style.getPropertyValue(name), n.style.getPropertyPriority(name)]);
    styles.set(n, values);
  };
  remember(content);
  const inert = new Map<HTMLElement, boolean>();
  let gesture:
    | {
        id: number;
        x: number;
        y: number;
        axis: string;
        origin: number;
        offset: number;
        lastX: number;
        time: number;
        velocity: number;
      }
    | undefined;
  let suppressUntil = 0;
  const paint = () => {
    const offset = disabled()
      ? 0
      : gesture?.axis === "x"
        ? gesture.offset
        : side()
          ? width(side()) * (side() === "start" ? 1 : -1)
          : 0;
    content.style.transform = `translateX(${offset * direction()}px)`;
    content.style.transitionDuration = gesture?.axis === "x" ? "0ms" : "";
    for (const n of areas()) {
      remember(n);
      if (!inert.has(n)) inert.set(n, n.inert);
      const edge = n.dataset["lensoSide"];
      n.style.visibility = (edge === "start" ? offset > 0 : offset < 0) ? "visible" : "hidden";
      n.inert = disabled() || side() !== edge;
    }
  };
  const finish = (cancel: boolean, time: number) => {
    const old = gesture;
    gesture = undefined;
    if (old && root.hasPointerCapture(old.id)) root.releasePointerCapture(old.id);
    if (old?.axis === "x") {
      suppressUntil = time + 350;
      if (!cancel && !disabled()) {
        const edge = old.offset >= 0 ? "start" : "end";
        const full = area(edge)?.querySelector<HTMLButtonElement>(
          '[data-slot="swipe-action"][data-lenso-active="true"]:not(:disabled)',
        );
        if (full && Math.abs(old.offset) >= root.clientWidth * 0.8) full.click();
        else {
          const velocity = time - old.time <= 100 ? old.velocity : 0;
          const projected = Math.max(
            0,
            (old.offset + velocity * 150) * (edge === "start" ? 1 : -1),
          );
          request(width(edge) > 0 && projected >= width(edge) / 2 ? edge : "");
        }
      }
    }
    paint();
  };
  const excluded =
    '[data-slot="swipe-action"],[data-slot="swipe-trigger"],input,textarea,select,[contenteditable]:not([contenteditable="false"]),[data-slot="list-reorder"],[data-slot="list-selection"]';
  const down = (e: PointerEvent) => {
    if (
      e.defaultPrevented ||
      disabled() ||
      !e.isPrimary ||
      e.button !== 0 ||
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      !(e.target instanceof Element) ||
      e.target.closest('[data-slot="swipe-actions"]') !== root ||
      e.target.closest(excluded)
    )
      return;
    const current = side() ? width(side()) * (side() === "start" ? 1 : -1) : 0;
    suppressUntil = 0;
    gesture = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      axis: "",
      origin: current,
      offset: current,
      lastX: e.clientX,
      time: e.timeStamp,
      velocity: 0,
    };
  };
  const move = (e: PointerEvent) => {
    if (disabled()) {
      finish(true, e.timeStamp);
      return;
    }
    const g = gesture;
    if (!g || g.id !== e.pointerId || e.defaultPrevented) return;
    const dx = e.clientX - g.x,
      dy = e.clientY - g.y;
    if (!g.axis && Math.max(Math.abs(dx), Math.abs(dy)) > 8)
      g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (g.axis !== "x") return;
    e.preventDefault();
    root.setPointerCapture(e.pointerId);
    const next = g.origin + dx * direction(),
      elapsed = e.timeStamp - g.time;
    if (elapsed > 0) g.velocity = ((e.clientX - g.lastX) * direction()) / elapsed;
    g.lastX = e.clientX;
    g.time = e.timeStamp;
    const edge = next >= 0 ? "start" : "end";
    const entries = area(edge)?.querySelectorAll<HTMLButtonElement>('[data-slot="swipe-action"]');
    const full =
      entries && [...entries].some((n) => !n.disabled && n.dataset["lensoActive"] === "true");
    const extent = full ? root.clientWidth : width(edge);
    g.offset = entries?.length
      ? Math.sign(next) *
        (Math.min(Math.abs(next), extent) + Math.max(0, Math.abs(next) - extent) / 4)
      : 0;
    paint();
  };
  const up = (e: PointerEvent) => {
    if (gesture?.id === e.pointerId) finish(e.defaultPrevented, e.timeStamp);
  };
  const cancel = (e: PointerEvent) => {
    if ((e.type !== "lostpointercapture" || e.target === root) && gesture?.id === e.pointerId)
      finish(true, e.timeStamp);
  };
  const click = (e: MouseEvent) => {
    if (e.defaultPrevented || !(e.target instanceof Element)) return;
    if (
      e.detail > 0 &&
      e.timeStamp < suppressUntil &&
      !e.target.closest('[data-slot="swipe-action"],[data-slot="swipe-trigger"]')
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  const key = (e: KeyboardEvent) => {
    if (!e.defaultPrevented && e.key === "Escape" && (side() || gesture)) {
      e.preventDefault();
      finish(true, e.timeStamp);
      request("");
    }
  };
  const observer = new MutationObserver(() => {
    if (disabled() && gesture) finish(true, performance.now());
    paint();
  });
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-lenso-value", "data-lenso-disabled", "disabled", "dir"],
  });
  const resize = new ResizeObserver(paint);
  resize.observe(root);
  for (const n of areas()) resize.observe(n);
  root.addEventListener("pointerdown", down);
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerup", up);
  root.addEventListener("pointercancel", cancel);
  root.addEventListener("lostpointercapture", cancel);
  root.addEventListener("click", click, true);
  root.addEventListener("keydown", key);
  controllers.set(root, () => {
    observer.disconnect();
    resize.disconnect();
    finish(true, performance.now());
    root.removeEventListener("pointerdown", down);
    root.removeEventListener("pointermove", move);
    root.removeEventListener("pointerup", up);
    root.removeEventListener("pointercancel", cancel);
    root.removeEventListener("lostpointercapture", cancel);
    root.removeEventListener("click", click, true);
    root.removeEventListener("keydown", key);
    for (const [n, values] of styles)
      for (const [name, [value, priority]] of values) {
        if (value) n.style.setProperty(name, value, priority);
        else n.style.removeProperty(name);
      }
    for (const [n, value] of inert) n.inert = value;
    controllers.delete(root);
  });
  paint();
}
export function endSwipe(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement && node.matches('[data-slot="swipe-actions"]'))
    controllers.get(node)?.();
}
