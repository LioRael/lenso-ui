// Adapted from Lenso NavigationBar and scroll-edge helpers for explicit Exact lifetimes.
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
import {
  navigationEdgeVisibility,
  navigationSoftBands,
  navigationSoftTintMask,
} from "./navigation-bar-value.js";
const selector = '[data-slot="navigation-bar"]';
const owners = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function create(root: HTMLElement) {
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const attrs = new Map<Element, Map<string, string | null>>();
  const styles = new Map<HTMLElement, Map<string, [string, string]>>();
  let disposed = false,
    frame = 0,
    scroll: HTMLElement | undefined,
    events: EventTarget | undefined;
  const attr = (node: Element, name: string, value: string | null) => {
    let values = attrs.get(node);
    if (!values) attrs.set(node, (values = new Map()));
    if (!values.has(name)) values.set(name, node.getAttribute(name));
    if (node.getAttribute(name) === value) return;
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  };
  const style = (node: HTMLElement, name: string, value: string) => {
    let values = styles.get(node);
    if (!values) styles.set(node, (values = new Map()));
    if (!values.has(name))
      values.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
    if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
  };
  const restoreAttributes = (node: Element) => {
    for (const [name, value] of attrs.get(node) ?? []) {
      if (value === null) node.removeAttribute(name);
      else node.setAttribute(name, value);
    }
    attrs.delete(node);
  };
  const restoreStyles = (node: HTMLElement) => {
    for (const [name, [value, priority]] of styles.get(node) ?? []) {
      if (value) node.style.setProperty(name, value, priority);
      else node.style.removeProperty(name);
    }
    styles.delete(node);
  };
  const own = (query: string) =>
    [...root.querySelectorAll<HTMLElement>(query)].filter((n) => n.closest(selector) === root);
  const config = () => own('[data-slot="navigation-bar-owner"]')[0];
  const heading = () => {
    const node = doc.getElementById(`${root.id}-large-title`);
    return node?.dataset["slot"] === "navigation-bar-large-title" ? node : undefined;
  };
  const inferScroll = () => {
    let parent = root.parentElement;
    while (parent && parent !== doc.body) {
      if (/auto|scroll/.test(getComputedStyle(parent).overflowY)) return parent;
      parent = parent.parentElement;
    }
    return doc.scrollingElement as HTMLElement;
  };
  const schedule = () => {
    if (!disposed && !frame) frame = view.requestAnimationFrame(measure);
  };
  const resize = new ResizeObserver(schedule),
    observed = new Set<Element>();
  const observe = () => {
    const large = heading();
    const next = new Set<Element>([
      root,
      ...(large ? [large] : []),
      ...(scroll ? [scroll, ...scroll.children] : []),
    ]);
    for (const n of observed)
      if (!next.has(n)) {
        resize.unobserve(n);
        observed.delete(n);
      }
    for (const n of next)
      if (!observed.has(n)) {
        resize.observe(n);
        observed.add(n);
      }
  };
  const content = new MutationObserver(() => {
    observe();
    schedule();
  });
  const measure = () => {
    frame = 0;
    if (disposed) return;
    for (const node of attrs.keys())
      if (node !== root && !root.contains(node)) restoreAttributes(node);
    for (const node of styles.keys()) if (!root.contains(node)) restoreStyles(node);
    const owner = config();
    if (!owner) return;
    const large = owner.dataset["lensoLarge"] === "true",
      title = heading();
    attr(root, "data-large", large ? "" : null);
    attr(
      root,
      "data-collapsed",
      large &&
        title &&
        title.getBoundingClientRect().bottom - 12 <= root.getBoundingClientRect().bottom
        ? ""
        : null,
    );
    const offset = scroll === doc.scrollingElement ? view.scrollY : (scroll?.scrollTop ?? 0);
    for (const edge of own('[data-slot="scroll-edge"]')) {
      const progress = navigationEdgeVisibility(
        offset,
        scroll?.scrollHeight ?? 0,
        scroll === doc.scrollingElement ? view.innerHeight : (scroll?.clientHeight ?? 0),
        edge.clientHeight,
      );
      style(edge, "--material-edge-visibility", progress.toFixed(3));
      attr(edge, "data-scroll-active", progress > 0.001 ? "" : null);
    }
    attr(root, "data-navigation-ready", "");
  };
  const sync = () => {
    if (disposed) return;
    for (const node of attrs.keys())
      if (node !== root && !root.contains(node)) restoreAttributes(node);
    for (const node of styles.keys()) if (!root.contains(node)) restoreStyles(node);
    const owner = config();
    if (!owner) return;
    const id = owner.dataset["lensoScrollport"] ?? "",
      edge = owner.dataset["lensoEdge"];
    if (!["none", "uniform", "soft"].includes(edge ?? ""))
      throw new RangeError(`Unknown NavigationBar edge: ${edge}`);
    const level = Number(owner.dataset["lensoLevel"]);
    if (!Number.isInteger(level) || level < 1 || level > 6)
      throw new RangeError(`Unknown NavigationBar heading level: ${level}`);
    const next = id ? doc.getElementById(id) : inferScroll();
    if (!(next instanceof HTMLElement))
      throw new Error(`Missing NavigationBar scroll target: ${id}`);
    if (next !== scroll) {
      events?.removeEventListener("scroll", schedule);
      scroll = next;
      events = next === doc.scrollingElement ? doc : next;
      events.addEventListener("scroll", schedule, { passive: true });
      content.disconnect();
      content.observe(next, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["class", "dir", "hidden"],
      });
    }
    for (const band of own('[data-slot="navigation-bar-soft-band"]')) {
      const key = band.dataset["lensoBand"],
        value = key === "tint" ? undefined : navigationSoftBands[Number(key)];
      if (key !== "tint" && !value) throw new RangeError(`Unknown navigation edge band: ${key}`);
      if (value) style(band, "--lenso-edge-band-blur", value.blur);
      style(band, "--lenso-edge-band-mask", value?.mask ?? navigationSoftTintMask);
    }
    observe();
    schedule();
  };
  const children = new MutationObserver(sync);
  children.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-lenso-large", "data-lenso-edge", "data-lenso-scrollport"],
  });
  const siblings = new MutationObserver(sync);
  if (root.parentElement) siblings.observe(root.parentElement, { childList: true });
  view.addEventListener("resize", schedule);
  root.addEventListener("load", schedule, true);
  sync();
  return {
    sync,
    end() {
      if (disposed) return;
      disposed = true;
      view.cancelAnimationFrame(frame);
      resize.disconnect();
      children.disconnect();
      siblings.disconnect();
      content.disconnect();
      events?.removeEventListener("scroll", schedule);
      view.removeEventListener("resize", schedule);
      root.removeEventListener("load", schedule, true);
      for (const node of attrs.keys()) restoreAttributes(node);
      for (const node of styles.keys()) restoreStyles(node);
      owners.delete(root);
    },
  };
}
export function updateNavigationBar(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.closest<HTMLElement>(selector);
  if (!root) return;
  if (!owners.has(root)) owners.set(root, create(root));
  else owners.get(root)?.sync();
}
export function endNavigationBar(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) owners.get(node)?.end();
}
