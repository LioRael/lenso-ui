// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: shared invalidation, animation discovery and batched source reads.
export class BackdropReads {
  private computed = new Map<Element, CSSStyleDeclaration>();
  private properties = new Map<Element, Map<string, string>>();
  private rectangles = new Map<Element, DOMRect>();
  private dimensions = new Map<HTMLElement, { width: number; height: number }>();

  style(element: Element): CSSStyleDeclaration {
    let value = this.computed.get(element);
    if (!value) this.computed.set(element, (value = getComputedStyle(element)));
    return value;
  }

  values(element: Element, names?: Iterable<string>): Map<string, string> {
    const computed = this.style(element);
    let values = this.properties.get(element);
    if (!values) this.properties.set(element, (values = new Map()));
    for (const name of names ?? computed)
      if (!values.has(name)) values.set(name, computed.getPropertyValue(name));
    return values;
  }

  box(element: Element): DOMRect {
    let box = this.rectangles.get(element);
    if (!box) this.rectangles.set(element, (box = element.getBoundingClientRect()));
    return box;
  }

  size(element: HTMLElement): { width: number; height: number } {
    let size = this.dimensions.get(element);
    if (!size)
      this.dimensions.set(
        element,
        (size = { width: element.offsetWidth, height: element.offsetHeight }),
      );
    return size;
  }
}

export interface BackdropChange {
  content: boolean;
  styles: boolean;
  animated: Map<Element, Set<string>>;
}

interface Client {
  element: HTMLElement;
  source: HTMLElement;
  layer: HTMLElement;
  active: boolean;
  dirty: boolean;
  geometry: boolean;
  prepare(): void;
  read(change: BackdropChange, reads: BackdropReads, geometry: boolean): () => void;
}

interface Source extends BackdropChange {
  clients: Set<Client>;
}

const sources = new Map<HTMLElement, Source>();
const clients = new Set<Client>();
const copies = new WeakSet<Node>();
const sizes = new Map<Element, number>();
let observer: MutationObserver | undefined;
let resized: ResizeObserver | undefined;
let frame = 0;
let queued = false;
let scheme: MediaQueryList | undefined;
interface AnimationSnapshot {
  signature: string;
  keyframes: string;
  target: Element;
}
let animations = new Map<Animation, AnimationSnapshot>();

function isCopy(node: Node | null): boolean {
  for (let at = node; at; at = at.parentNode) if (copies.has(at)) return true;
  return false;
}

function invalidate(styles = false): void {
  for (const client of clients) client.dirty = client.geometry = true;
  if (styles) for (const source of sources.values()) source.styles = true;
  schedule();
}

function flush(): void {
  queued = false;
  if (document.hidden) return;
  const reads = new BackdropReads();
  const work: (() => void)[] = [];
  for (const client of clients) if (client.active && client.dirty) client.prepare();
  for (const source of sources.values()) {
    if (![...source.clients].some((client) => client.active)) continue;
    for (const client of source.clients) {
      if (!client.active || !client.dirty) continue;
      client.dirty = false;
      work.push(client.read(source, reads, client.geometry));
      client.geometry = false;
    }
    source.content = source.styles = false;
    source.animated = new Map();
  }
  // Source styles and all geometry are read before any attached copy is written.
  for (const write of work) write();
}

function schedule(): void {
  if (queued) return;
  queued = true;
  // A spring writes during rAF. Its mutation must reach the copy in the same
  // rendering update, rather than trailing it by one frame.
  queueMicrotask(flush);
}

const timing = new Set(["offset", "computedOffset", "easing", "composite"]);
const kebab = (name: string) =>
  name.startsWith("--") ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function animationChanged(target: Element, keyframes?: ComputedKeyframe[]): void {
  const names = new Set<string>();
  if (keyframes)
    for (const keyframe of keyframes)
      for (const key of Object.keys(keyframe)) if (!timing.has(key)) names.add(kebab(key));
  for (const [element, source] of sources) {
    if (element.contains(target)) {
      if (keyframes && ![...names].some((name) => name.startsWith("--"))) {
        const previous = source.animated.get(target) ?? new Set<string>();
        for (const name of names) previous.add(name);
        source.animated.set(target, previous);
      } else source.styles = true;
      for (const client of source.clients) {
        client.dirty = true;
        if (element === target) client.geometry = true;
      }
    } else if (target.contains(element)) {
      source.styles = true;
      for (const client of source.clients) client.dirty = client.geometry = true;
    }
  }
  for (const client of clients)
    if (target.contains(client.element)) client.dirty = client.geometry = true;
  // Layout animations can move siblings without resizing the source itself.
  if (
    !keyframes ||
    [...names].some((name) =>
      /^(width|height|margin|padding|inset|top|left|right|bottom|font|flex|grid|gap)/.test(name),
    )
  )
    for (const client of clients) client.dirty = client.geometry = true;
}

function tick(): void {
  frame = 0;
  if (document.hidden || ![...clients].some((client) => client.active)) return;
  const next = new Map<Animation, AnimationSnapshot>();
  let changed = false;
  // WAAPI has no document-wide start event. One shared discovery pass preserves
  // programmatic animations and paused seeks without polling every lens's box.
  for (const animation of document.getAnimations()) {
    const effect = animation.effect;
    if (
      !(effect instanceof KeyframeEffect) ||
      !effect.target ||
      effect.pseudoElement ||
      isCopy(effect.target)
    )
      continue;
    const target = effect.target;
    const keyframes = effect.getKeyframes();
    // setKeyframes and paused seeks also have no mutation/start event.
    const definition = JSON.stringify(keyframes);
    const signature = `${animation.currentTime}:${definition}`;
    next.set(animation, { signature, keyframes: definition, target });
    const previous = animations.get(animation);
    if (previous?.signature !== signature || previous.target !== target) {
      if (previous && previous.target !== target) animationChanged(previous.target);
      // Replacing keyframes can remove properties that the old effect set.
      animationChanged(
        target,
        previous && previous.keyframes !== definition ? undefined : keyframes,
      );
      changed = true;
    }
  }
  for (const [animation, previous] of animations)
    if (!next.has(animation)) {
      animationChanged(previous.target);
      changed = true;
    }
  animations = next;
  if (changed) schedule();
  frame = requestAnimationFrame(tick);
}

function wake(): void {
  if (!frame && !document.hidden && [...clients].some((client) => client.active))
    frame = requestAnimationFrame(tick);
  schedule();
}

function geometry(): void {
  invalidate();
}
function styles(): void {
  invalidate(true);
}
function interaction(event: Event): void {
  const target = event.target;
  if (!(target instanceof Node) || isCopy(target)) return;
  // Foreground hover/press can change lens geometry, but does not restyle an
  // unrelated sibling backdrop. Only events within its source refresh its CSS.
  for (const [element, source] of sources)
    if (element.contains(target) || target.contains(element)) source.styles = true;
  invalidate();
}
function loaded(event: Event): void {
  if (event.target instanceof HTMLLinkElement) styles();
  else interaction(event);
}
function visibility(): void {
  cancelAnimationFrame(frame);
  frame = 0;
  if (!document.hidden) {
    invalidate(true);
    wake();
  }
}
const styleEvents = [
  "pointerover",
  "pointerout",
  "pointerdown",
  "pointerup",
  "focusin",
  "focusout",
  "input",
  "change",
];

const pressProperties =
  /--lg-(?:press-(?:scale|translate)|light-(?:x|y|radius|label)|x|y):[^;]*(?:;|$)/g;

function start(): void {
  observer = new MutationObserver((records) => {
    for (const record of records) {
      if (isCopy(record.target)) continue;
      if (
        record.type === "childList" &&
        [...record.addedNodes, ...record.removedNodes].every(isCopy)
      )
        continue;
      const own = [...clients].find((client) => client.element === record.target);
      // Only the press transform is local to one lens. Other attribute edits
      // can move siblings without resizing them (for example a margin change).
      if (
        own &&
        record.attributeName === "style" &&
        (record.oldValue ?? "").replace(pressProperties, "").trim() ===
          own.element.style.cssText.replace(pressProperties, "").trim()
      ) {
        own.dirty = own.geometry = true;
        continue;
      }
      for (const client of clients) client.dirty = client.geometry = true;
      for (const [element, source] of sources) {
        if (element.contains(record.target)) {
          source.styles = true;
          if (
            record.type !== "attributes" ||
            !["style", "class", "id"].includes(record.attributeName!)
          )
            source.content = true;
        } else if (record.target.contains(element)) source.styles = true;
      }
    }
    schedule();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeOldValue: true,
    childList: true,
    characterData: true,
    subtree: true,
  });
  resized = new ResizeObserver(() => invalidate(true));
  document.addEventListener("scroll", geometry, { capture: true, passive: true });
  window.addEventListener("resize", styles);
  document.addEventListener("visibilitychange", visibility);
  for (const name of styleEvents) document.addEventListener(name, interaction, true);
  document.addEventListener("load", loaded, true);
  document.fonts.addEventListener("loadingdone", styles);
  scheme = matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", styles);
}

function observeSize(element: Element, delta: number): void {
  const count = (sizes.get(element) ?? 0) + delta;
  if (count === 1 && delta === 1) resized?.observe(element);
  if (count) sizes.set(element, count);
  else {
    sizes.delete(element);
    resized?.unobserve(element);
  }
}

export function observeBackdrop(entry: Omit<Client, "active" | "dirty" | "geometry">): {
  invalidate(): void;
  visible(active: boolean): void;
  stop(): void;
} {
  if (!clients.size) start();
  copies.add(entry.layer);
  const client: Client = { ...entry, active: true, dirty: true, geometry: true };
  clients.add(client);
  let source = sources.get(entry.source);
  if (!source) {
    source = { clients: new Set(), content: false, styles: true, animated: new Map() };
    sources.set(entry.source, source);
  }
  source.clients.add(client);
  observeSize(entry.source, 1);
  observeSize(entry.element, 1);
  wake();
  return {
    invalidate() {
      client.dirty = client.geometry = true;
      schedule();
    },
    visible(active) {
      client.active = active;
      client.dirty = client.geometry = true;
      if (active) source.styles = true;
      wake();
    },
    stop() {
      clients.delete(client);
      source.clients.delete(client);
      if (!source.clients.size) sources.delete(entry.source);
      observeSize(entry.source, -1);
      observeSize(entry.element, -1);
      if (clients.size) return;
      observer?.disconnect();
      resized?.disconnect();
      observer = resized = undefined;
      animations.clear();
      cancelAnimationFrame(frame);
      frame = 0;
      document.removeEventListener("scroll", geometry, { capture: true });
      window.removeEventListener("resize", styles);
      document.removeEventListener("visibilitychange", visibility);
      for (const name of styleEvents) document.removeEventListener(name, interaction, true);
      document.removeEventListener("load", loaded, true);
      document.fonts.removeEventListener("loadingdone", styles);
      scheme?.removeEventListener("change", styles);
      scheme = undefined;
    },
  };
}
