import { press } from "@lenso/glass/motion";
import {
  attachFusion,
  glassIsOpaque,
  observeGlassPreferences,
  type FusionGroup,
} from "@lenso/glass/fusion";

const selector = '[data-slot="glass-container"], [data-lenso-kind="toolbar-fusion-group"]';
const containers = new WeakMap<HTMLElement, Container>();
const eligible = new WeakSet<HTMLElement>();
const membership = new WeakMap<HTMLElement, Container>();
const dirty = new Set<Container>();
let queued = false;
function schedule(owner: Container) {
  if (owner.disposed) return;
  dirty.add(owner);
  if (queued) return;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    const owners = [...dirty];
    dirty.clear();
    // Restore every old plane before another container can claim a moved member.
    for (const owner of owners) owner.prepare();
    for (const owner of owners) owner.start();
  });
}
interface Container {
  disposed: boolean;
  group: FusionGroup;
  data: DOMStringMap;
  stop(): void;
  prepare(): void;
  start(): void;
  end(): void;
}
function createContainer(root: HTMLElement, data: DOMStringMap): Container {
  const group: FusionGroup = { members: new Set(), update: () => {} };
  let detach: (() => void) | undefined;
  let surface: HTMLElement | undefined;
  let active = false,
    spacing = 20,
    previousSpacing = 20;
  const original = root.style.getPropertyValue("--lenso-exact-fusion-tint"),
    priority = root.style.getPropertyPriority("--lenso-exact-fusion-tint");
  const owner: Container = {
    disposed: false,
    group,
    data,
    stop() {
      detach?.();
      detach = undefined;
    },
    prepare() {
      if (owner.disposed) return;
      const next =
        root.querySelector<HTMLElement>(':scope > [data-slot="glass-container-surface"]') ??
        undefined;
      const value = Number(owner.data["lensoSpacing"]);
      spacing = Number.isFinite(value) ? Math.max(0, value) : 20;
      const tint = owner.data["lensoTint"] ?? "";
      if (root.style.getPropertyValue("--lenso-exact-fusion-tint") !== tint) {
        if (tint) root.style.setProperty("--lenso-exact-fusion-tint", tint);
        else root.style.removeProperty("--lenso-exact-fusion-tint");
      }
      active =
        root.isConnected &&
        owner.data["lensoFusionDisabled"] !== "true" &&
        !glassIsOpaque(root) &&
        Boolean(next);
      const members = active
        ? [...root.querySelectorAll<HTMLElement>('[data-hatch="lenso-ui"]')].filter(
            (node) => eligible.has(node) && node.closest(selector) === root,
          )
        : [];
      const changed =
        surface !== next ||
        previousSpacing !== spacing ||
        members.length !== group.members.size ||
        members.some((node) => !group.members.has(node));
      if (changed || !active) owner.stop();
      surface = next;
      previousSpacing = spacing;
      for (const member of group.members)
        if (!members.includes(member)) {
          if (membership.get(member) === owner) membership.delete(member);
        }
      group.members.clear();
      for (const member of members) {
        group.members.add(member);
        membership.set(member, owner);
      }
    },
    start() {
      if (!owner.disposed && active && surface && !detach)
        detach = attachFusion(root, surface, group, spacing);
    },
    end() {
      owner.disposed = true;
      dirty.delete(owner);
      owner.stop();
      observer.disconnect();
      stopPreferences?.();
      for (const member of group.members)
        if (membership.get(member) === owner) membership.delete(member);
      group.members.clear();
      if (original) root.style.setProperty("--lenso-exact-fusion-tint", original, priority);
      else root.style.removeProperty("--lenso-exact-fusion-tint");
    },
  };
  const observer = new MutationObserver(() => schedule(owner));
  observer.observe(root, { childList: true, subtree: true });
  const stopPreferences = observeGlassPreferences(root, () => schedule(owner));
  schedule(owner);
  return owner;
}

export function updateGlassContainer(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (!["glass-container", "toolbar-fusion-group"].includes(data["lensoKind"] ?? "")) {
    containers.get(node)?.end();
    containers.delete(node);
    return;
  }
  let owner = containers.get(node);
  if (!owner) {
    owner = createContainer(node, data);
    containers.set(node, owner);
  } else {
    owner.data = data;
    schedule(owner);
  }
}

/** A member's optics are about to be rebound; restore the old shared plane first. */
export function refreshFusionMember(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const owner = membership.get(node);
  if (owner) {
    owner.stop();
    schedule(owner);
  }
}

export function updateFusionMember(node: HTMLElement | SVGElement, enabled: boolean) {
  if (!(node instanceof HTMLElement)) return;
  if (enabled) eligible.add(node);
  else eligible.delete(node);
  const previous = membership.get(node);
  if (previous) schedule(previous);
  const root = node.parentElement?.closest<HTMLElement>(selector);
  const owner = root ? containers.get(root) : undefined;
  if (owner) schedule(owner);
}

export function endGlassContainer(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  refreshFusionMember(node);
  eligible.delete(node);
  const owner = containers.get(node);
  owner?.end();
  containers.delete(node);
}

export function connectFusionItem(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (
    node instanceof HTMLElement &&
    data["lensoKind"] === "glass-container-item" &&
    data["lensoElastic"] === "true"
  )
    return press(node);
  return undefined;
}
