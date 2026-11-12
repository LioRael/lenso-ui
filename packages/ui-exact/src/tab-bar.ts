import { press, prefersReducedMotion } from "@lenso/glass/motion";
import { connectTabBarMotion } from "./tab-bar-motion.js";
import { connectTabBarMinimize } from "./tab-bar-minimize.js";
import { observeFocus } from "./search-field.js";
const selector = '[data-slot="tab-bar"]';
const owners = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function create(root: HTMLElement) {
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const own = <T extends HTMLElement>(query: string) =>
    [...root.querySelectorAll<T>(query)].filter((n) => n.closest(selector) === root);
  const minRequest = own<HTMLInputElement>('[data-slot="tab-bar-minimize-request"]')[0],
    activation = own<HTMLInputElement>('[data-slot="tab-bar-activate-request"]')[0];
  if (!minRequest || !activation) return;
  const attrs = new Map<Element, Map<string, string | null>>(),
    styles = new Map<HTMLElement, Map<string, string>>();
  const attr = (node: Element, name: string, value: string | null) => {
    let map = attrs.get(node);
    if (!map) attrs.set(node, (map = new Map()));
    if (!map.has(name)) map.set(name, node.getAttribute(name));
    if (node.getAttribute(name) === value) return;
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  };
  const style = (node: HTMLElement, name: string, value: string) => {
    let map = styles.get(node);
    if (!map) styles.set(node, (map = new Map()));
    if (!map.has(name)) map.set(name, node.style.getPropertyValue(name));
    if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
  };
  const minimized = () => root.dataset["lensoMinimized"] === "true";
  const emit = (node: HTMLInputElement, value: string) => {
    if (disposed) return;
    node.value = value;
    node.dispatchEvent(new view.Event("input", { bubbles: true }));
  };
  const activate = (item: HTMLElement) => {
    if (!item.matches(':disabled,[aria-disabled="true"]'))
      emit(activation, item.dataset["lensoValue"] ?? "");
  };
  let disposed = false,
    scrollKey = "",
    stopScroll: (() => void) | undefined;
  const groups = new Map<HTMLElement, { key: string; sync(): void; end(): void }>();
  const connectScroll = () => {
    const mode = root.dataset["lensoAutoMinimize"] ?? "none",
      id = root.dataset["lensoScrollport"] ?? "",
      key = JSON.stringify([mode, id, minimized()]);
    if (key === scrollKey) return;
    scrollKey = key;
    stopScroll?.();
    stopScroll = undefined;
    if (!["none", "up", "down"].includes(mode))
      throw new RangeError(`Unknown TabBar scroll minimize mode: ${mode}`);
    if (mode === "none") return;
    const element = id ? doc.getElementById(id) : undefined;
    if (id && !(element instanceof HTMLElement))
      throw new Error(`Missing TabBar scroll target: ${id}`);
    const source = element ?? view;
    const position = () => {
      const offset = element ? element.scrollTop : view.scrollY,
        max = element
          ? element.scrollHeight - element.clientHeight
          : (doc.scrollingElement?.scrollHeight ?? 0) - view.innerHeight;
      return Math.max(0, Math.min(offset, Math.max(0, max)));
    };
    let previous = position(),
      direction = 0,
      distance = 0,
      requested = minimized();
    const scroll = () => {
      const next = position(),
        delta = next - previous;
      previous = next;
      if (next <= 0 && mode === "down") {
        direction = 0;
        distance = 0;
        if (requested) {
          requested = false;
          emit(minRequest, "false");
        }
        return;
      }
      if (!delta) return;
      const nextDirection = delta > 0 ? 1 : -1;
      if (direction !== nextDirection) {
        direction = nextDirection;
        distance = 0;
      }
      distance += Math.abs(delta);
      const nextMinimized = mode === "down" ? direction > 0 : direction < 0;
      if (distance >= 8 && requested !== nextMinimized) {
        requested = nextMinimized;
        emit(minRequest, String(nextMinimized));
      }
    };
    source.addEventListener("scroll", scroll, { passive: true });
    stopScroll = () => source.removeEventListener("scroll", scroll);
  };
  const paint = () => {
    if (disposed) return;
    attr(root, "data-minimized", minimized() ? "" : null);
    const lift = Number(root.dataset["lensoLift"]);
    style(root, "--tab-bar-lift", `${Number.isFinite(lift) ? Math.max(0, lift) : 20}px`);
    for (const item of own<HTMLElement>("[data-tab-bar-item]")) {
      attr(item, "data-current", item.dataset["lensoCurrent"] === "true" ? "" : null);
      attr(item, "data-tab-bar-has-icon", item.dataset["lensoHasIcon"] === "true" ? "" : null);
    }
    const current = own<HTMLElement>("[data-tab-bar-group]");
    for (const [group, owner] of groups)
      if (!current.includes(group)) {
        owner.end();
        groups.delete(group);
      }
    for (const group of current) {
      const separate = group.dataset["lensoSeparate"] === "true",
        layout = group.dataset["layout"] ?? "phone",
        elastic = group.dataset["lensoElastic"] === "true";
      if (layout !== "phone" && layout !== "tablet")
        throw new RangeError(`Unknown TabBar layout: ${layout}`);
      attr(group, "data-minimized", minimized() ? "" : null);
      attr(group, "data-separate", separate ? "" : null);
      const key = JSON.stringify([layout, separate, elastic]);
      let owner = groups.get(group);
      if (owner && owner.key !== key) {
        owner.end();
        groups.delete(group);
        owner = undefined;
      }
      if (!owner) {
        const list = group.querySelector<HTMLElement>("[data-tab-bar-list]");
        if (!list) continue;
        let focusAfterExpand = false,
          focusOnMinimize = false,
          previousMinimized = minimized();
        const minimize = connectTabBarMinimize(group, separate, layout);
        const stopMotion = !separate ? connectTabBarMotion(group, activate) : undefined;
        const clickSeparate = (event: MouseEvent) => {
          const target = event.target instanceof Element ? event.target : undefined;
          if (target?.closest("[data-tab-bar-group]") !== group) return;
          const item = target.closest<HTMLElement>("[data-tab-bar-destination]");
          if (
            !item ||
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
          )
            return;
          if (item.getAttribute("aria-disabled") === "true") {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }
          activate(item);
        };
        if (separate) view.addEventListener("click", clickSeparate, true);
        const expandIntent = (event: MouseEvent) => {
          if (
            event.target instanceof Element &&
            event.target.closest("[data-tab-bar-expand]")?.closest("[data-tab-bar-group]") === group
          )
            focusAfterExpand = true;
        };
        const expandFocus = (event: FocusEvent) => {
          if (event.target instanceof Element && event.target.matches("[data-tab-bar-expand]"))
            focusAfterExpand = true;
        };
        const expandBlur = (event: FocusEvent) => {
          if (
            minimized() &&
            event.target instanceof Element &&
            event.target.matches("[data-tab-bar-expand]")
          )
            focusAfterExpand = false;
        };
        group.addEventListener("focusin", expandFocus);
        group.addEventListener("focusout", expandBlur);
        group.addEventListener("click", expandIntent, true);
        const stopPress = elastic
          ? press(
              group,
              (event) => {
                const target = event.target instanceof Element ? event.target : null;
                return (
                  !prefersReducedMotion() &&
                  !event.defaultPrevented &&
                  !event.metaKey &&
                  !event.ctrlKey &&
                  !event.shiftKey &&
                  !event.altKey &&
                  Boolean(target?.closest("[data-tab-bar-item],[data-tab-bar-expand]")) &&
                  !target?.closest(':disabled,[aria-disabled="true"],[data-disabled]')
                );
              },
              "--tab-bar-press",
            )
          : undefined;
        owner = {
          key,
          sync() {
            const min = minimized();
            if (min && !separate && list.contains(doc.activeElement)) focusOnMinimize = true;
            if (!min) focusOnMinimize = false;
            attr(list, "aria-hidden", min && !separate ? "true" : null);
            attr(list, "inert", min && !separate ? "" : null);
            if (!separate && min && focusOnMinimize) {
              const expand = group.querySelector<HTMLButtonElement>("[data-tab-bar-expand]");
              if (expand) {
                expand.focus({ preventScroll: true });
                focusOnMinimize = false;
              }
            }
            if (!min && previousMinimized && focusAfterExpand) {
              focusAfterExpand = false;
              (
                list.querySelector<HTMLElement>(
                  '[data-current]:not(:disabled,[aria-disabled="true"])',
                ) ??
                list.querySelector<HTMLElement>(
                  '[data-tab-bar-item]:not(:disabled,[aria-disabled="true"])',
                )
              )?.focus({ preventScroll: true });
            }
            if (min !== previousMinimized) minimize?.update(min);
            previousMinimized = min;
          },
          end() {
            stopPress?.();
            stopMotion?.();
            minimize?.end();
            view.removeEventListener("click", clickSeparate, true);
            group.removeEventListener("click", expandIntent, true);
            group.removeEventListener("focusin", expandFocus);
            group.removeEventListener("focusout", expandBlur);
          },
        };
        groups.set(group, owner);
      }
      owner.sync();
    }
    connectScroll();
    for (const [node, values] of attrs)
      if (!node.isConnected && !root.contains(node)) {
        for (const [name, value] of values) {
          if (value === null) node.removeAttribute(name);
          else node.setAttribute(name, value);
        }
        attrs.delete(node);
      }
  };
  const observer = new MutationObserver(paint);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      "data-lenso-current",
      "data-lenso-minimized",
      "data-lenso-separate",
      "data-lenso-elastic",
      "data-layout",
      "data-lenso-lift",
      "data-lenso-has-icon",
      "data-lenso-auto-minimize",
      "data-lenso-scrollport",
    ],
  });
  const stopFocus = observeFocus(doc);
  paint();
  return {
    sync: paint,
    end() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      stopScroll?.();
      for (const owner of groups.values()) owner.end();
      stopFocus();
      for (const [node, values] of attrs)
        for (const [name, value] of values) {
          if (value === null) node.removeAttribute(name);
          else node.setAttribute(name, value);
        }
      for (const [node, values] of styles)
        for (const [name, value] of values) {
          if (value) node.style.setProperty(name, value);
          else node.style.removeProperty(name);
        }
      owners.delete(root);
    },
  };
}
export function updateTabBar(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(selector) ? node : node.closest<HTMLElement>(selector);
  if (!root) return;
  if (!owners.has(root)) {
    const owner = create(root);
    if (owner) owners.set(root, owner);
  }
  owners.get(root)?.sync();
}
export function endTabBar(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement && node.matches(selector)) owners.get(node)?.end();
}
