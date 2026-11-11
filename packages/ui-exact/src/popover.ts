import {
  blockPopoverHover,
  clearPopoverHover,
  hoverPopoverTrigger,
  isHoverPopover,
  popoverInputType,
  registerPopoverHoverHost,
} from "./popover-hover.js";
import {
  arrow as arrowMiddleware,
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  type Placement,
} from "@floating-ui/dom";
import { anchoredMaterial } from "./anchored-material.js";
import { modalOwner, popoverTabbables } from "./modal-focus.js";

interface Controller {
  update(data: DOMStringMap): void;
  end(): void;
}
const controllers = new WeakMap<HTMLElement, Controller>();

function createPopover(root: HTMLElement, initial: DOMStringMap): Controller {
  let data = initial;
  let opener: HTMLElement | undefined;
  let stopTracking: (() => void) | undefined;
  let stopMaterial: (() => void) | undefined;
  let material: HTMLElement | undefined;
  let frame = 0;
  let returnTimer = 0;
  let epoch = 0;
  let disposed = false;
  let closing = false;
  let touchPress = false;
  let focusOnPosition = false;
  let focusOrigin: Element | null = null;
  let nativeFocusOrigin: Element | null = null;
  const attributes = new Map<Element, Map<string, string | null>>();
  const styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const attr = (node: Element, name: string, value: string | null) => {
    let saved = attributes.get(node);
    if (!saved) attributes.set(node, (saved = new Map()));
    if (!saved.has(name)) saved.set(name, node.getAttribute(name));
    if (value === null) node.removeAttribute(name);
    else if (node.getAttribute(name) !== value) node.setAttribute(name, value);
  };
  const style = (node: HTMLElement, name: string, value: string) => {
    let saved = styles.get(node);
    if (!saved) styles.set(node, (saved = new Map()));
    if (!saved.has(name))
      saved.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
    if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
  };
  const originalAttribute = (node: Element, name: string) => {
    const saved = attributes.get(node);
    return saved?.has(name) ? saved.get(name)! : node.getAttribute(name);
  };
  const popup = () => root.querySelector<HTMLElement>(':scope > [data-slot="popover-popup"]');
  const isOpen = () => !closing && root.matches(":popover-open");
  const markTriggers = (shown: boolean) => {
    const content = popup();
    for (const node of root.ownerDocument.querySelectorAll<HTMLElement>("button[popovertarget]"))
      if (
        node.getAttribute("popovertarget") === root.id &&
        node.getAttribute("popovertargetaction") !== "hide"
      ) {
        attr(node, "aria-expanded", String(shown && node === opener));
        if (content?.id) attr(node, "aria-controls", content.id);
      }
  };
  const accessible = (open: boolean) => {
    const content = popup();
    if (!content) return;
    attr(root, "inert", open ? originalAttribute(root, "inert") : "");
    attr(content, "inert", open ? originalAttribute(content, "inert") : "");
    attr(content, "aria-hidden", open ? originalAttribute(content, "aria-hidden") : "true");
    if (!open) return;
    for (const node of content.querySelectorAll<HTMLElement>(
      "button,a[href],input,select,textarea,summary,[contenteditable=true]",
    ))
      if (
        node.closest("[popover]") === root &&
        !node.hasAttribute("tabindex") &&
        node.tabIndex >= 0
      )
        attr(node, "tabindex", "0");
  };

  const finite = (key: string, fallback: number) => {
    const value = Number(data[key] ?? fallback);
    return Number.isFinite(value) ? value : fallback;
  };
  const physicalSide = () => {
    const side = data["lensoSide"] ?? "bottom";
    if (side === "inline-start") return data["lensoDirection"] === "rtl" ? "right" : "left";
    if (side === "inline-end") return data["lensoDirection"] === "rtl" ? "left" : "right";
    return side;
  };
  const preferenceQueries = [
    matchMedia("(forced-colors: active)"),
    matchMedia("(prefers-reduced-transparency: reduce)"),
    matchMedia("(prefers-contrast: more)"),
  ];
  const preferences = () => {
    const surface = popup()?.querySelector<HTMLElement>(':scope > [data-slot="popover-material"]');
    if (surface !== material) {
      stopMaterial?.();
      stopMaterial = undefined;
      material = surface ?? undefined;
      if (material && popup()) stopMaterial = anchoredMaterial(material, popup()!);
    }
    if (!material) return;
    const opaque =
      preferenceQueries.some((query) => query.matches) ||
      material.closest("[data-contrast]")?.getAttribute("data-contrast") === "increased";
    attr(material, "data-material-opaque", opaque ? "" : null);
  };
  const position = async () => {
    const content = popup();
    if (disposed || !isOpen() || !opener?.isConnected || !content) return;
    const current = ++epoch;
    attr(root, "data-lenso-position-pending", "");
    const arrow = [...content.querySelectorAll<HTMLElement>('[data-slot="popover-arrow"]')].find(
      (node) => node.closest('[data-slot="popover-popup"]') === content,
    );
    const side = physicalSide();
    const align = data["lensoAlign"] ?? "center";
    const placement = `${side}${align === "center" ? "" : `-${align}`}` as Placement;
    const padding = Math.max(0, finite("lensoCollisionPadding", 8));
    const avoid = data["lensoCollisionAvoidance"] !== "false";
    const result = await computePosition(opener, root, {
      placement,
      strategy: "fixed",
      middleware: [
        offset({
          mainAxis: finite("lensoSideOffset", 16),
          crossAxis: finite("lensoAlignOffset", 0),
        }),
        avoid && flip({ padding }),
        avoid && shift({ padding }),
        size({
          padding,
          apply({ availableWidth, availableHeight, rects }) {
            if (disposed || current !== epoch || !isOpen()) return;
            style(root, "--available-width", `${Math.max(0, availableWidth)}px`);
            style(root, "--available-height", `${Math.max(0, availableHeight)}px`);
            const box = getComputedStyle(content);
            const inset = [
              box.paddingTop,
              box.paddingBottom,
              box.borderTopWidth,
              box.borderBottomWidth,
            ].reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
            style(
              root,
              "--lenso-exact-popover-content-height",
              `${Math.max(0, availableHeight - inset)}px`,
            );
            style(root, "--anchor-width", `${rects.reference.width}px`);
            style(root, "--anchor-height", `${rects.reference.height}px`);
          },
        }),
        arrow && arrowMiddleware({ element: arrow, padding: 24 }),
      ],
    });
    if (disposed || current !== epoch || !isOpen()) return;
    style(root, "--lenso-exact-popover-x", `${result.x}px`);
    style(root, "--lenso-exact-popover-y", `${result.y}px`);
    attr(root, "data-lenso-positioned", "");
    attr(root, "data-lenso-position-pending", null);
    const resolved = result.placement.split("-")[0]!;
    attr(content, "data-side", resolved);
    attr(content, "data-align", result.placement.slice(resolved.length + 1) || "center");
    attr(content, "data-direction", data["lensoDirection"] ?? "ltr");
    let originX = "50%",
      originY = "50%";
    if (arrow) {
      attr(arrow, "data-uncentered", result.middlewareData.arrow?.centerOffset ? "" : null);
      attr(arrow, "data-side", resolved);
      attr(arrow, "data-direction", data["lensoDirection"] ?? "ltr");
      const { x, y } = result.middlewareData.arrow ?? {};
      if (x !== undefined) {
        style(arrow, "left", `${x}px`);
        originX = `${x + arrow.offsetWidth / 2}px`;
      } else style(arrow, "left", "auto");
      if (y !== undefined) {
        style(arrow, "top", `${y}px`);
        originY = `${y + arrow.offsetHeight / 2}px`;
      } else style(arrow, "top", "auto");
    }
    if (resolved === "top") originY = "100%";
    else if (resolved === "bottom") originY = "0%";
    else if (resolved === "left") originX = "100%";
    else originX = "0%";
    style(root, "--transform-origin", `${originX} ${originY}`);
    if (focusOnPosition) {
      focusOnPosition = false;
      const active = document.activeElement;
      if (active === focusOrigin || active === opener || active === document.body) {
        const target = touchPress ? content : (popoverTabbables(content)[0] ?? content);
        target.focus({ preventScroll: true });
      }
    }
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!disposed && isOpen()) attr(content, "data-starting-style", null);
        frame = 0;
      });
    });
  };
  const track = () => {
    stopTracking?.();
    stopTracking = undefined;
    if (!isOpen()) return;
    if (!opener?.isConnected) opener = hoverPopoverTrigger(root);
    if (!opener?.isConnected)
      opener = [...document.querySelectorAll<HTMLButtonElement>("button[popovertarget]")].find(
        (node) =>
          node.getAttribute("popovertarget") === root.id &&
          node.getAttribute("popovertargetaction") !== "hide" &&
          !node.disabled,
      );
    if (!opener) return;
    if (data["lensoDisableAnchorTracking"] === "true") void position();
    else stopTracking = autoUpdate(opener, root, () => void position());
  };
  const beforeToggle = (event: ToggleEvent) => {
    if (event.target !== root) return;
    cancelAnimationFrame(frame);
    clearTimeout(returnTimer);
    frame = 0;
    ++epoch;
    const opening = event.newState === "open";
    closing = !opening;
    const content = popup();
    if (!content) return;
    if (opening) {
      accessible(true);
      attr(root, "data-lenso-positioned", "");
      document.addEventListener("focusin", focusOut);
      const source =
        hoverPopoverTrigger(root) ?? (event as ToggleEvent & { source?: Element | null }).source;
      const active = document.activeElement;
      opener =
        source instanceof HTMLElement
          ? source
          : active instanceof HTMLElement &&
              active !== document.body &&
              active !== document.documentElement &&
              !root.contains(active)
            ? active
            : opener;
      if (!opener)
        opener = [...document.querySelectorAll<HTMLButtonElement>("button[popovertarget]")].find(
          (node) =>
            node.getAttribute("popovertarget") === root.id &&
            node.getAttribute("popovertargetaction") !== "hide" &&
            !node.disabled,
        );
      touchPress = !isHoverPopover(root) && popoverInputType(opener) === "touch";
      attr(root, "data-lenso-open-reason", isHoverPopover(root) ? "hover" : "press");
      focusOrigin = document.activeElement;
      nativeFocusOrigin = focusOrigin;
      focusOnPosition = !isHoverPopover(root);
      markTriggers(true);
      attr(content, "data-ending-style", null);
      attr(
        content,
        "data-starting-style",
        matchMedia("(prefers-reduced-motion: reduce)").matches ? null : "",
      );
      attr(content, "data-open", "");
      preferences();
    } else {
      const restoreFocus =
        !isHoverPopover(root) &&
        (root.contains(document.activeElement) || document.activeElement === document.body);
      blockPopoverHover(opener);
      clearPopoverHover(root);
      markTriggers(false);
      accessible(false);
      const returnTarget = opener;
      const nativeReturnTarget = nativeFocusOrigin;
      const closedAt = epoch;
      // The native dispatch can drain microtasks before hiding and focus cleanup finish.
      returnTimer = window.setTimeout(() => {
        const active = document.activeElement;
        if (
          !disposed &&
          closedAt === epoch &&
          !isOpen() &&
          restoreFocus &&
          returnTarget?.isConnected &&
          (active === document.body ||
            active === nativeReturnTarget ||
            (active !== null && root.contains(active)))
        )
          returnTarget.focus({ preventScroll: true });
      });
      focusOnPosition = false;
      attr(root, "data-lenso-position-pending", null);
      document.removeEventListener("focusin", focusOut);
      attr(content, "data-open", null);
      attr(content, "data-starting-style", null);
      attr(content, "data-ending-style", "");
      stopTracking?.();
      stopTracking = undefined;
    }
  };
  const toggle = (event: Event) => {
    if (event.target !== root) return;
    if (isOpen()) track();
  };
  const focusOut = (event: FocusEvent) => {
    if (!isOpen() || isHoverPopover(root) || !(event.target instanceof Element)) return;
    if (root.contains(event.target) || opener?.contains(event.target)) return;
    root.hidePopover();
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      event.key !== "Tab" ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.defaultPrevented ||
      !isOpen() ||
      isHoverPopover(root)
    )
      return;
    const content = popup();
    if (!content) return;
    const items = popoverTabbables(content);
    if (event.shiftKey && event.target === items[0]) {
      event.preventDefault();
      root.hidePopover();
      opener?.focus();
    } else if (!event.shiftKey && event.target === items.at(-1) && opener) {
      const outside = popoverTabbables(modalOwner(root) ?? root.ownerDocument.body).filter(
        (node) => !root.contains(node),
      );
      const index = outside.indexOf(opener);
      if (index < 0) return;
      const next = outside[index + 1] ?? outside[0];
      event.preventDefault();
      next?.focus();
      if (isOpen()) root.hidePopover();
    }
  };
  const stopHoverHost = registerPopoverHoverHost(root, {
    info: () => ({ trigger: opener, touchPress }),
    sync: () => markTriggers(isOpen()),
    activate(trigger, focus) {
      opener = trigger;
      touchPress = !isHoverPopover(root) && popoverInputType(trigger) === "touch";
      focusOrigin = document.activeElement;
      focusOnPosition = focus;
      attr(root, "data-lenso-open-reason", isHoverPopover(root) ? "hover" : "press");
      accessible(true);
      markTriggers(isOpen());
      if (isOpen()) track();
    },
  });
  root.addEventListener("beforetoggle", beforeToggle);
  root.addEventListener("toggle", toggle);
  root.addEventListener("keydown", keydown);
  const observer = new MutationObserver(() => {
    accessible(isOpen());
    preferences();
    if (isOpen()) void position();
  });
  observer.observe(root, { childList: true, subtree: true });
  for (let node: HTMLElement | null = root; node; node = node.parentElement)
    observer.observe(node, { attributes: true, attributeFilter: ["data-contrast"] });
  for (const query of preferenceQueries) query.addEventListener("change", preferences);
  preferences();
  return {
    update(next) {
      data = next;
      accessible(isOpen());
      markTriggers(isOpen());
      style(root, "direction", data["lensoDirection"] ?? "ltr");
      preferences();
      if (isOpen()) track();
    },
    end() {
      disposed = true;
      ++epoch;
      cancelAnimationFrame(frame);
      clearTimeout(returnTimer);
      stopHoverHost();
      stopTracking?.();
      stopMaterial?.();
      observer.disconnect();
      for (const query of preferenceQueries) query.removeEventListener("change", preferences);
      root.removeEventListener("beforetoggle", beforeToggle);
      root.removeEventListener("toggle", toggle);
      root.removeEventListener("keydown", keydown);
      document.removeEventListener("focusin", focusOut);
      for (const [node, saved] of attributes)
        for (const [name, value] of saved)
          if (value === null) node.removeAttribute(name);
          else node.setAttribute(name, value);
      for (const [node, saved] of styles)
        for (const [name, [value, priority]] of saved)
          if (value) node.style.setProperty(name, value, priority);
          else node.style.removeProperty(name);
    },
  };
}

export function updatePopover(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (data["lensoKind"] !== "popover-positioner") {
    endPopover(node);
    return;
  }
  let owner = controllers.get(node);
  if (!owner) {
    owner = createPopover(node, data);
    controllers.set(node, owner);
  }
  owner.update(data);
}
export function endPopover(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  controllers.get(node)?.end();
  controllers.delete(node);
}
