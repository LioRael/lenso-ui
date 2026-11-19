import {
  prepareGlassBackdrop,
  type BackdropSnapshotOptions,
  type GlassBackdropScene,
} from "@lenso/glass";
import type { MenuTexture } from "./vector-paint.js";

const pages = new WeakMap<HTMLElement, MenuTexture & { bounds: DOMRect }>();
const updates = new WeakMap<HTMLElement, () => boolean>();

function menuChain(example: HTMLElement, popup: HTMLElement) {
  const roots = [...example.querySelectorAll<HTMLElement>('[data-lenso-slot="menu-trigger"]')];
  const scopes = new Set<ParentNode>([
    example.getRootNode() as ParentNode,
    popup.getRootNode() as ParentNode,
    popup.ownerDocument,
  ]);
  const children = [...scopes].flatMap((scope) => [
    ...scope.querySelectorAll<HTMLElement>('[data-lenso-slot="menu-submenu-trigger"]'),
  ]);
  const controls = (trigger: HTMLElement, menu: HTMLElement) =>
    !!menu.id && !!trigger.getAttribute("aria-controls")?.split(/\s+/).includes(menu.id);
  const seen = new Set<HTMLElement>();
  for (let menu: HTMLElement | null = popup; menu && !seen.has(menu);) {
    seen.add(menu);
    if (roots.some((trigger) => controls(trigger, menu!))) return [...seen].reverse();
    menu =
      children
        .find((trigger) => controls(trigger, menu!))
        ?.closest<HTMLElement>('[data-lenso-slot="menu-popup"]') ?? null;
  }
  return undefined;
}

/** Register this example's root menus and their native submenu ownership chains. */
export function menuBackdrop(
  example: HTMLElement,
  lens: HTMLElement,
  excludeSource?: (element: Element) => boolean,
): BackdropSnapshotOptions | undefined {
  const popup = lens.closest<HTMLElement>('[data-lenso-slot="menu-popup"]');
  const source = example.closest<HTMLElement>("#nd-notebook-layout");
  const view = lens.ownerDocument.defaultView;
  if (!popup || !source || !view) return;
  const foreground = popup.querySelector<HTMLElement>('[data-lenso-slot="menu-content"]');
  if (!foreground) return;
  const liveGeometry = !!lens.parentElement?.matches('[data-lenso-slot="menu-surface"]');
  // The SDK may commit the trigger link after the lens ref, especially in WebKit.
  const owns = () => !!menuChain(example, popup);
  const exclude = (node: Node) => {
    const element = node instanceof Element ? node : node.parentElement;
    return (
      !!(element && excludeSource?.(element)) ||
      !!element?.closest('[data-lenso-slot="menu-popup"], [data-material-live-paints]') ||
      !!(
        liveGeometry &&
        element?.closest('[data-lenso-slot="menu-trigger"]') &&
        example.contains(element)
      )
    );
  };
  return {
    source,
    foreground,
    liveGeometry,
    liveSource: liveGeometry,
    exclude,
    subscribe(invalidate) {
      const observer = new MutationObserver((records) => {
        const parents = menuChain(example, popup)?.slice(0, -1) ?? [];
        if (
          records.some((record) => {
            if (
              popup.contains(record.target) ||
              !parents.some((parent) => parent.contains(record.target))
            )
              return false;
            if (!liveGeometry || record.type !== "attributes") return true;
            // Retry a rejected outline without restarting preparation on every parent spring write.
            if (
              record.attributeName === "style" &&
              record.target instanceof HTMLElement &&
              !lens.parentElement?.querySelector("[data-glass-backdrop-snapshot]")
            ) {
              const before = record.oldValue?.match(/(?:^|;)\s*outline[^;]*/g)?.join(";") ?? "";
              const after =
                record.target.style.cssText.match(/(?:^|;)\s*outline[^;]*/g)?.join(";") ?? "";
              if (before !== after) return true;
            }
            if (
              record.attributeName !== "style" ||
              !(record.target instanceof HTMLElement) ||
              !record.target.matches('[data-lenso-slot="menu-submenu-trigger"]')
            )
              return false;
            // The shared title hides its source row once, including while preparation is pending.
            const before =
              record.oldValue?.match(/(?:^|;)\s*opacity:\s*([^;]*)/)?.[1]?.trim() ?? "";
            return before !== record.target.style.opacity;
          })
        )
          invalidate();
      });
      observer.observe(source.getRootNode(), {
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        childList: true,
        characterData: true,
      });
      return () => observer.disconnect();
    },
    ready: () =>
      example.isConnected &&
      popup.isConnected &&
      (popup.hasAttribute("data-open") ||
        (liveGeometry && popup.hasAttribute("data-ending-style"))) &&
      owns() &&
      (liveGeometry ||
        (!popup.hasAttribute("data-ending-style") &&
          foreground.style.opacity === "1" &&
          foreground.style.filter === "")),
    async prepare(signal, checkpoint) {
      const chain = menuChain(example, popup);
      if (!chain) return;
      const layers = [];
      for (const parent of chain.slice(0, -1)) {
        const snapshot = parent.querySelector<HTMLElement>(
          '[data-glass-backdrop-snapshot][data-glass-renderer="scene"]',
        );
        const pixels = snapshot?.shadowRoot?.querySelector("canvas");
        const content = parent.querySelector<HTMLElement>('[data-lenso-slot="menu-content"]');
        const element = parent.querySelector<HTMLElement>("[data-material-lens]");
        const update = element && updates.get(element);
        if (!snapshot || !pixels || !content || !element || !update || content.style.filter) return;
        layers.push({
          pixels,
          foreground: content,
          element,
          update,
        });
      }
      const dpr = view.devicePixelRatio;
      if (![1, 2].includes(dpr) || signal.aborted) return;
      const box = lens.getBoundingClientRect();
      const final = liveGeometry ? popup.getBoundingClientRect() : box;
      const trigger =
        example
          .querySelector<HTMLElement>('[data-lenso-slot="menu-trigger"]')
          ?.getBoundingClientRect() ?? final;
      const area = liveGeometry
        ? new DOMRect(
            Math.min(box.left, final.left, trigger.left),
            Math.min(box.top, final.top, trigger.top),
            Math.max(box.right, final.right, trigger.right) -
              Math.min(box.left, final.left, trigger.left),
            Math.max(box.bottom, final.bottom, trigger.bottom) -
              Math.min(box.top, final.top, trigger.top),
          )
        : box;
      if (liveGeometry && chain.length === 1) {
        area.x -= final.width;
        area.width += final.width * 2;
      }
      // Keep the registered page paint on its original raster grid, including fractional scrolling.
      const raster = (
        source.querySelector<HTMLElement>('[data-lenso-backdrop="true"]') ?? source
      ).getBoundingClientRect();
      const tile = 254;
      const phase = (point: number, origin: number, scroll: number) => {
        const offset = (point + scroll) * dpr - Math.round((origin + scroll) * dpr);
        return ((offset % tile) + tile) % tile;
      };
      const x = phase(area.x, raster.x, view.scrollX),
        y = phase(area.y, raster.y, view.scrollY);
      if (![x, y].every((n) => Number.isFinite(n) && n >= 0)) return;
      const style = view.getComputedStyle(lens);
      const radius = parseFloat(style.borderTopLeftRadius),
        reach = Number(style.getPropertyValue("--lg-source-reach")),
        blur = parseFloat(style.getPropertyValue("--lg-blur"));
      if (![radius, reach, blur].every((n) => Number.isFinite(n) && n >= 0)) return;
      // Preserve the page raster phase while including the whole optical neighbourhood.
      const padding = Math.ceil(((reach + 3 * blur + 4) * dpr) / tile) * tile;
      const cached = chain.length > 1 ? pages.get(example) : undefined;
      const halo = reach + 3 * blur + 4;
      const base =
        cached &&
        area.left - halo >= cached.bounds.left &&
        area.top - halo >= cached.bounds.top &&
        area.right + halo <= cached.bounds.right &&
        area.bottom + halo <= cached.bounds.bottom
          ? cached
          : undefined;
      const bounds = base
        ? new DOMRect(base.bounds.x, base.bounds.y, base.bounds.width, base.bounds.height)
        : new DOMRect(
            area.x - (x + padding) / dpr,
            area.y - (y + padding) / dpr,
            (Math.ceil((area.width * dpr + x) / tile) * tile + 2 * padding) / dpr,
            (Math.ceil((area.height * dpr + y) / tile) * tile + 2 * padding) / dpr,
          );
      const { captureMenuTexture } = await import("./vector-paint.js");
      if (signal.aborted) return;
      const captured = await captureMenuTexture(
        source,
        bounds,
        area,
        dpr,
        radius,
        reach,
        blur,
        checkpoint,
        { exclude, layers, base },
      );
      if (!captured) return;
      const { pixels, opaque } = captured;
      const scene: GlassBackdropScene = {
        renderer: "scene",
        pixels,
        opaque,
        revision: captured.revision,
        x: box.x - bounds.x,
        y: box.y - bounds.y,
        ...(liveGeometry ? { bounds } : {}),
      };
      let transferred = false;
      try {
        const prepared =
          !signal.aborted && (await prepareGlassBackdrop(lens, scene, signal, checkpoint));
        if (!prepared) return;
        const page = {
          ...captured,
          bounds,
          get revision() {
            return captured.revision;
          },
        };
        const origin = { x: bounds.x, y: bounds.y };
        const update = () => {
          const shift = captured.relocate(lens.getBoundingClientRect());
          if (!shift) return false;
          bounds.x = origin.x + shift.x;
          bounds.y = origin.y + shift.y;
          scene.revision = captured.revision;
          return prepared.update?.() ?? false;
        };
        if (chain.length === 1) pages.set(example, page);
        if (liveGeometry) updates.set(lens, update);
        transferred = true;
        return {
          ...prepared,
          ...(liveGeometry && { update }),
          ...(liveGeometry && {
            mutate: (records: readonly MutationRecord[]) => captured.mutate(records) && update(),
          }),
          dispose() {
            try {
              prepared.dispose();
            } finally {
              if (pages.get(example) === page) pages.delete(example);
              if (updates.get(lens) === update) updates.delete(lens);
              captured.dispose();
            }
          },
        };
      } finally {
        if (!transferred) captured.dispose();
      }
    },
  };
}
