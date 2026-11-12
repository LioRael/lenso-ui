import {
  validateRefresh,
  refreshAxis,
  refreshDistance,
  type RefreshStatus,
} from "./refresh-control-value.js";
const selector = '[data-slot="refresh-control"]';
const owners = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
type Phase = RefreshStatus | "pulling" | "armed";
const ignorePull =
  'input,textarea,select,[contenteditable]:not([contenteditable="false"]),[data-list-reorder],[data-list-selection],[data-swipe-action],[data-swipe-trigger],[data-slot="list-reorder"],[data-slot="swipe-trigger"],[data-slot="swipe-action"]';
function create(root: HTMLElement) {
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const own = <T extends HTMLElement>(part: string) =>
    [...root.querySelectorAll<T>(`[data-slot="refresh-control-${part}"]`)].filter(
      (n) => n.closest(selector) === root,
    );
  const viewport = own<HTMLElement>("viewport")[0],
    content = own<HTMLElement>("content")[0],
    indicator = own<HTMLElement>("indicator")[0],
    request = own<HTMLInputElement>("request")[0];
  if (!viewport || !content || !indicator || !request) return;
  const status = () => root.dataset["lensoMode"] ?? "idle",
    threshold = () => Number(root.dataset["lensoThreshold"]),
    disabled = () => root.dataset["lensoDisabled"] === "true";
  validateRefresh(threshold(), status());
  const attributes = new Map<Element, Map<string, string | null>>(),
    styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const attr = (node: Element, name: string, value: string | null) => {
    let map = attributes.get(node);
    if (!map) attributes.set(node, (map = new Map()));
    if (!map.has(name)) map.set(name, node.getAttribute(name));
    if (node.getAttribute(name) === value) return;
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  };
  const style = (node: HTMLElement, name: string, value: string) => {
    let map = styles.get(node);
    if (!map) styles.set(node, (map = new Map()));
    if (!map.has(name))
      map.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
    if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
  };
  let disposed = false,
    phase = status() as Phase,
    distance = phase === "refreshing" ? 56 : 0,
    previous = JSON.stringify([status(), root.dataset["lensoValue"]]),
    pending = false,
    frame = 0,
    suppressUntil = 0,
    wasDisabled = false;
  let gesture:
    | { id: number; x: number; y: number; start: TouchEvent; axis: boolean; distance: number }
    | undefined;
  const texts = new Map<HTMLElement, string>();
  const text = (node: HTMLElement, value: string) => {
    if (!texts.has(node)) texts.set(node, node.textContent ?? "");
    if (node.textContent !== value) node.textContent = value;
  };
  const paint = () => {
    if (disposed) return;
    validateRefresh(threshold(), status());
    const model = JSON.stringify([status(), root.dataset["lensoValue"]]);
    if (model !== previous) {
      previous = model;
      pending = false;
      gesture = undefined;
      phase = status() as Phase;
      distance = phase === "refreshing" ? 56 : 0;
    }
    const newlyDisabled = disabled() && !wasDisabled;
    wasDisabled = disabled();
    if (newlyDisabled) {
      gesture = undefined;
      if (phase !== "refreshing") {
        phase = "idle";
        distance = 0;
      }
    }
    const labels: Record<Phase, string> = {
      idle: "",
      pulling: root.dataset["lensoPullLabel"] ?? "",
      armed: root.dataset["lensoReleaseLabel"] ?? "",
      refreshing: root.dataset["lensoRefreshingLabel"] ?? "",
      complete: root.dataset["lensoCompleteLabel"] ?? "",
      error: root.dataset["lensoErrorLabel"] ?? "",
    };
    const message = labels[phase],
      progress = Math.min(1, distance / threshold());
    attr(root, "data-state", phase);
    attr(root, "aria-busy", phase === "refreshing" ? "true" : null);
    style(content, "transform", `translateY(${distance}px)`);
    style(indicator, "transform", `translateY(${Math.min(0, distance - 56)}px)`);
    style(indicator, "opacity", String(Math.min(1, distance / 56)));
    for (const n of own<HTMLElement>("progress")) {
      style(n, "transform", `rotate(${progress * 180}deg)`);
      attr(n, "hidden", phase === "refreshing" ? "" : null);
      attr(n, "data-lenso-active", String(phase !== "refreshing"));
    }
    for (const n of own<HTMLElement>("spinner")) {
      attr(n, "hidden", phase === "refreshing" ? null : "");
      attr(n, "data-lenso-active", String(phase === "refreshing"));
    }
    for (const n of own<HTMLElement>("message")) text(n, message);
    for (const n of own<HTMLElement>("status"))
      text(n, ["armed", "refreshing", "complete", "error"].includes(phase) ? message : "");
    for (const n of own<HTMLElement>("error")) {
      attr(n, "hidden", phase === "error" ? null : "");
      attr(n, "data-lenso-active", String(phase === "error"));
    }
    for (const n of own<HTMLButtonElement>("trigger"))
      attr(n, "aria-disabled", disabled() || phase === "refreshing" ? "true" : null);
  };
  const begin = (fromGesture: boolean) => {
    if (disabled() || pending || status() === "refreshing") return false;
    pending = true;
    gesture = undefined;
    phase = "refreshing";
    distance = 56;
    paint();
    if (fromGesture) {
      request.value = "";
      request.dispatchEvent(new view.Event("input", { bubbles: true }));
    }
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => {
      frame = view.requestAnimationFrame(() => {
        if (disposed) return;
        if (pending) {
          pending = false;
          phase = status() as Phase;
          distance = phase === "refreshing" ? 56 : 0;
          paint();
        }
      });
    });
    return true;
  };
  const start = (event: TouchEvent) => {
    if (
      disabled() ||
      pending ||
      status() === "refreshing" ||
      event.defaultPrevented ||
      event.touches.length !== 1 ||
      viewport.scrollTop > 0 ||
      !(event.target instanceof Element) ||
      event.target.closest(selector) !== root ||
      event.target.closest(ignorePull)
    )
      return;
    const touch = event.touches[0]!;
    gesture = {
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      start: event,
      axis: false,
      distance: 0,
    };
  };
  const move = (event: TouchEvent) => {
    const active = gesture;
    if (!active) return;
    const touch = [...event.touches].find((t) => t.identifier === active.id);
    if (!touch || event.touches.length !== 1 || disabled() || active.start.defaultPrevented) {
      gesture = undefined;
      if (status() !== "refreshing") {
        phase = "idle";
        distance = 0;
        paint();
      }
      return;
    }
    const dx = touch.clientX - active.x,
      dy = touch.clientY - active.y;
    if (!active.axis) {
      const axis = refreshAxis(dx, dy);
      if (axis === "ignore") {
        gesture = undefined;
        return;
      }
      if (axis === "pull") active.axis = true;
    }
    if (!active.axis) return;
    if (event.defaultPrevented || !event.cancelable) {
      gesture = undefined;
      phase = "idle";
      distance = 0;
      paint();
      return;
    }
    event.preventDefault();
    active.distance = refreshDistance(dy, threshold());
    distance = active.distance;
    phase = distance >= threshold() ? "armed" : "pulling";
    paint();
  };
  const end = (event: TouchEvent) => {
    const active = gesture;
    if (!active || ![...event.changedTouches].some((t) => t.identifier === active.id)) return;
    gesture = undefined;
    if (active.axis) suppressUntil = event.timeStamp + 350;
    if (event.type !== "touchcancel" && !event.defaultPrevented && active.distance >= threshold())
      begin(true);
    else if (status() !== "refreshing" && active.axis) {
      phase = "idle";
      distance = 0;
      paint();
    }
  };
  // The stock router observes links at document capture; suppress the release click first.
  const click = (event: MouseEvent) => {
    if (!(event.target instanceof Element) || event.target.closest(selector) !== root) return;
    if (viewport.contains(event.target) && event.detail > 0 && event.timeStamp < suppressUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    const trigger = event.target.closest('[data-slot="refresh-control-trigger"]');
    if (!trigger) return;
    if (disabled() || pending || status() === "refreshing") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (event.defaultPrevented) return;
    begin(false);
  };
  viewport.addEventListener("touchstart", start, { passive: true });
  viewport.addEventListener("touchmove", move, { passive: false });
  viewport.addEventListener("touchend", end);
  viewport.addEventListener("touchcancel", end);
  view.addEventListener("click", click, true);
  const observer = new MutationObserver(paint);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      "data-lenso-mode",
      "data-lenso-value",
      "data-lenso-disabled",
      "data-lenso-threshold",
    ],
  });
  paint();
  return {
    sync: paint,
    end() {
      if (disposed) return;
      disposed = true;
      gesture = undefined;
      observer.disconnect();
      view.cancelAnimationFrame(frame);
      viewport.removeEventListener("touchstart", start);
      viewport.removeEventListener("touchmove", move);
      viewport.removeEventListener("touchend", end);
      viewport.removeEventListener("touchcancel", end);
      view.removeEventListener("click", click, true);
      for (const [node, map] of attributes)
        for (const [name, value] of map) {
          if (value === null) node.removeAttribute(name);
          else node.setAttribute(name, value);
        }
      for (const [node, map] of styles)
        for (const [name, [value, priority]] of map) {
          if (value) node.style.setProperty(name, value, priority);
          else node.style.removeProperty(name);
        }
      for (const [node, value] of texts) node.textContent = value;
      owners.delete(root);
    },
  };
}
export function updateRefresh(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(selector) ? node : node.closest<HTMLElement>(selector);
  if (!root) return;
  if (!owners.has(root)) {
    const owner = create(root);
    if (owner) owners.set(root, owner);
  }
  owners.get(root)?.sync();
}
export function endRefresh(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(selector) ? node : node.closest<HTMLElement>(selector);
  if (root && (root === node || node.dataset["slot"] === "refresh-control-viewport"))
    owners.get(root)?.end();
}
