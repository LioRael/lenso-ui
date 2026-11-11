// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: shared invalidation, animation discovery and batched source reads.
export class BackdropReads {
  private computed = new Map<Element, CSSStyleDeclaration>();
  sharedSource = false;
  private namedProperties = new Map<Element, Map<string, string>>();
  private selections = new Map<ReadonlySet<string>, Map<Element, Map<string, string>>>();
  private properties = new Map<Element, Map<string, string>>();
  private textFields = new Map<TextField, TextSnapshot>();
  private rectangles = new Map<Element, DOMRect>();
  private dimensions = new Map<HTMLElement, { width: number; height: number }>();

  style(element: Element): CSSStyleDeclaration {
    let value = this.computed.get(element);
    if (!value) this.computed.set(element, (value = getComputedStyle(element)));
    return value;
  }

  animationValues(element: Element, names: ReadonlySet<string>): Map<string, string> {
    let elements = this.selections.get(names);
    if (!elements) this.selections.set(names, (elements = new Map()));
    let selected = elements.get(element);
    if (!selected) elements.set(element, (selected = this.values(element, names)));
    return selected;
  }

  values(element: Element, names?: Iterable<string>): Map<string, string> {
    const all = this.properties.get(element);
    if (!names && all) return all;
    const computed = this.style(element);
    const values = new Map<string, string>();
    let named = this.namedProperties.get(element);
    if (names && !named) this.namedProperties.set(element, (named = new Map()));
    for (const name of names ?? computed) {
      const value = all?.get(name) ?? named?.get(name) ?? computed.getPropertyValue(name);
      values.set(name, value);
      if (names) named!.set(name, value);
    }
    if (!names) this.properties.set(element, values);
    return values;
  }

  text(field: TextField): TextSnapshot {
    let state = this.textFields.get(field);
    if (!state) this.textFields.set(field, (state = readText(field)));
    return state;
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
  paintOnly?: boolean;
  animationSetChanged?: boolean;
}

export type TextField = HTMLInputElement | HTMLTextAreaElement;
export interface TextSnapshot {
  value: string;
  left: number;
  top: number;
}

function readText(field: TextField): TextSnapshot {
  return { value: field.value, left: field.scrollLeft, top: field.scrollTop };
}

export function isBackdropTextField(node: EventTarget | null): node is TextField {
  return (
    node instanceof HTMLTextAreaElement ||
    (node instanceof HTMLInputElement &&
      /^(text|search|url|tel|email|password|number)$/.test(node.type))
  );
}

interface Client {
  element: HTMLElement;
  source: HTMLElement;
  layer: HTMLElement;
  active: boolean;
  dirty: boolean;
  geometry: boolean;
  pendingContent: boolean;
  editText?(field: TextField, state: TextSnapshot): void;
  prepare(): void;
  read(change: BackdropChange, reads: BackdropReads, geometry: boolean): () => void;
}

interface Source extends BackdropChange {
  clients: Set<Client>;
}

const pendingText = new Set<TextField>();
const sources = new Map<HTMLElement, Source>();
const clients = new Set<Client>();
const lensClients = new WeakMap<HTMLElement, Set<Client>>();
const newlyObserved = new WeakSet<HTMLElement>();
const copies = new WeakSet<Node>();
const sizes = new Map<Element, number>();
let observer: MutationObserver | undefined;
let resized: ResizeObserver | undefined;
let frame = 0;
let queued = false;
let scheme: MediaQueryList | undefined;
interface AnimationSnapshot {
  time: string;
  keyframes: string;
  names: Set<string>;
  target: Element;
}
let animations = new Map<Animation, AnimationSnapshot>();

function isCopy(node: Node | null): boolean {
  for (let at = node; at; at = at.parentNode)
    if (copies.has(at) || (at instanceof Element && at.hasAttribute("data-lenso-glass-optics")))
      return true;
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
    reads.sharedSource = source.clients.size > 1;
    const paintOnly =
      source.animated.size > 0 &&
      [...source.animated.values()].every((names) =>
        [...names].every((name) => simplePaint.has(name)),
      );
    for (const client of source.clients) {
      client.pendingContent ||= source.content;
      if (!client.active || !client.dirty) continue;
      client.dirty = false;
      work.push(
        client.read(
          { ...source, content: client.pendingContent, paintOnly },
          reads,
          client.geometry,
        ),
      );
      client.pendingContent = false;
      client.geometry = false;
    }
    source.content = source.styles = false;
    source.animationSetChanged = false;
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

function animatedProperties(keyframes: ComputedKeyframe[]): Set<string> {
  const names = new Set<string>();
  for (const keyframe of keyframes)
    for (const key of Object.keys(keyframe)) if (!timing.has(key)) names.add(kebab(key));
  return names;
}

// Both properties can be explicitly inherited. Their resolved values are enough
// to reproduce the paint, unlike color which also feeds shadows, borders and SVG.
const simplePaint = new Set(["opacity", "background-color"]);

function addProperties(source: Source, target: Element, names: Set<string>): void {
  const previous = source.animated.get(target);
  if (!previous) source.animated.set(target, names);
  else if ([...names].some((name) => !previous.has(name)))
    source.animated.set(target, new Set([...previous, ...names]));
}

function animationChanged(target: Element, names: Set<string>, restore = false): void {
  const paints = [...names].filter((name) => simplePaint.has(name));
  for (const [element, source] of sources) {
    if (element.contains(target)) {
      source.animationSetChanged ||= restore;
      if (
        (restore && (!names.size || paints.length !== names.size)) ||
        [...names].some((name) => name.startsWith("--"))
      ) {
        source.styles = true;
      } else {
        addProperties(source, target, names);
        if (paints.length && target.childElementCount) {
          const inherited = new Set(paints);
          for (const child of target.querySelectorAll("*")) addProperties(source, child, inherited);
        }
      }
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
    restore ||
    [...names].some((name) =>
      /^(width|height|margin|padding|inset|top|left|right|bottom|font|flex|grid|gap)/.test(name),
    )
  )
    for (const client of clients) client.dirty = client.geometry = true;
}

function tick(): void {
  frame = 0;
  if (document.hidden || ![...clients].some((client) => client.active)) return;
  // Read after input handlers have normalized controlled values, before paint.
  if (pendingText.size) {
    for (const field of pendingText) editText(field);
    pendingText.clear();
  }
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
    const time = String(animation.currentTime);
    const previous = animations.get(animation);
    const replaced = previous !== undefined && previous.keyframes !== definition;
    const names = previous && !replaced ? previous.names : animatedProperties(keyframes);
    next.set(animation, { time, keyframes: definition, names, target });
    if (previous?.time !== time || previous.target !== target || replaced) {
      if (previous && previous.target !== target)
        animationChanged(previous.target, previous.names, true);
      if (replaced) animationChanged(target, new Set([...previous.names, ...names]), true);
      else animationChanged(target, names);
      changed = true;
    }
  }
  for (const [animation, previous] of animations)
    if (!next.has(animation)) {
      animationChanged(previous.target, previous.names, true);
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

function geometry(event: Event): void {
  if (isBackdropTextField(event.target)) {
    if (!isCopy(event.target)) pendingText.add(event.target);
    return;
  }
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
  for (const [element, source] of sources) {
    if (!element.contains(target) && !target.contains(element)) continue;
    source.styles = true;
    if ((event.type === "input" || event.type === "change") && isBackdropTextField(target))
      pendingText.add(target);
  }
  invalidate();
}
// Text values are live DOM properties. Editing one produces no mutation to
// rebuild from, and only copies of its marked source need the new value.
function editText(field: TextField): void {
  if (isCopy(field)) return;
  let state: TextSnapshot | undefined;
  for (const [element, source] of sources) {
    if (!element.contains(field)) continue;
    state ??= readText(field);
    for (const client of source.clients) if (client.active) client.editText?.(field, state);
  }
}

function reset(event: Event): void {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  // The reset event precedes the browser's cancelable default action.
  setTimeout(() => {
    if (!event.defaultPrevented)
      for (const field of form.elements) if (isBackdropTextField(field)) editText(field);
  }, 0);
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

function observeDocument(rootIsLens: boolean): void {
  observer?.observe(document.documentElement, {
    attributes: true,
    attributeOldValue: rootIsLens,
    childList: true,
    characterData: true,
    subtree: true,
  });
}

function observeLensStyle(element: HTMLElement, active: boolean): void {
  // Only the press comparison needs old style text. Optical copies can carry
  // hundreds of declarations, all of which would otherwise be serialized per write.
  if (active) {
    // Already queued document records predate the lens registration and can lack its old value.
    const owners = lensClients.get(element);
    newlyObserved.add(element);
    queueMicrotask(() => {
      if (lensClients.get(element) === owners) newlyObserved.delete(element);
    });
  }
  // An empty filter retires this registration without dropping other lenses' queued records.
  if (element === document.documentElement) observeDocument(active);
  else
    observer?.observe(element, {
      attributes: true,
      attributeFilter: active ? ["style"] : [],
      attributeOldValue: active,
    });
}

function start(): void {
  observer = new MutationObserver((records) => {
    const targets = new Map<Node, boolean>();
    const lensStyles = new Map<HTMLElement, string>();
    const pressed = new Set<HTMLElement>();
    for (const record of records) {
      const target = record.target;
      if (isCopy(target)) continue;
      if (
        record.type === "childList" &&
        [...record.addedNodes, ...record.removedNodes].every(isCopy)
      )
        continue;
      const lens = target as HTMLElement;
      if (
        record.attributeName === "style" &&
        lensClients.has(lens) &&
        (record.oldValue !== null || !newlyObserved.has(lens))
      ) {
        let style = lensStyles.get(lens);
        if (style === undefined) {
          style = lens.style.cssText.replace(pressProperties, "").trim();
          lensStyles.set(lens, style);
        }
        if ((record.oldValue ?? "").replace(pressProperties, "").trim() === style) {
          pressed.add(lens);
          continue;
        }
      }
      // A later style edit must not downgrade an earlier content edit on the same node.
      const content =
        record.type !== "attributes" || !["style", "class", "id"].includes(record.attributeName!);
      targets.set(target, content || targets.get(target) === true);
    }
    if (targets.size) {
      for (const [element, source] of sources) {
        for (const [target, content] of targets) {
          if (element.contains(target)) {
            source.styles = true;
            source.content ||= content;
          } else if (target.contains(element)) source.styles = true;
        }
      }
      invalidate();
    } else if (pressed.size) {
      // Native paint and copied optics can share the same moving lens.
      for (const lens of pressed)
        for (const client of lensClients.get(lens)!) client.dirty = client.geometry = true;
      schedule();
    }
  });
  observeDocument(false);
  resized = new ResizeObserver(() => invalidate(true));
  document.addEventListener("scroll", geometry, { capture: true, passive: true });
  window.addEventListener("resize", styles);
  document.addEventListener("visibilitychange", visibility);
  for (const name of styleEvents) document.addEventListener(name, interaction, true);
  document.addEventListener("reset", reset, true);
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

export function observeBackdrop(
  entry: Omit<Client, "active" | "dirty" | "geometry" | "pendingContent">,
): {
  invalidate(): void;
  visible(active: boolean): void;
  stop(): void;
} {
  if (!clients.size) start();
  copies.add(entry.layer);
  const client: Client = {
    ...entry,
    active: true,
    dirty: true,
    geometry: true,
    pendingContent: false,
  };
  clients.add(client);
  let owners = lensClients.get(entry.element);
  if (!owners) {
    lensClients.set(entry.element, (owners = new Set()));
    observeLensStyle(entry.element, true);
  }
  owners.add(client);
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
      if (!clients.delete(client)) return;
      owners.delete(client);
      if (!owners.size) {
        lensClients.delete(entry.element);
        observeLensStyle(entry.element, false);
      }
      source.clients.delete(client);
      if (!source.clients.size) sources.delete(entry.source);
      observeSize(entry.source, -1);
      observeSize(entry.element, -1);
      if (clients.size) return;
      observer?.disconnect();
      resized?.disconnect();
      observer = resized = undefined;
      pendingText.clear();
      animations.clear();
      cancelAnimationFrame(frame);
      frame = 0;
      document.removeEventListener("scroll", geometry, { capture: true });
      window.removeEventListener("resize", styles);
      document.removeEventListener("visibilitychange", visibility);
      for (const name of styleEvents) document.removeEventListener(name, interaction, true);
      document.removeEventListener("reset", reset, true);
      document.removeEventListener("load", loaded, true);
      document.fonts.removeEventListener("loadingdone", styles);
      scheme?.removeEventListener("change", styles);
      scheme = undefined;
    },
  };
}
