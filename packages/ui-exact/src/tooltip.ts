/** Native-element Tooltip interaction adapted from Base UI 1.9.0.
 * Copyright (c) 2019 Material-UI SAS.
 * Copyright (c) 2021-present Floating UI contributors. MIT License; see NOTICES.md.
 */
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
import { createHoverCorridor } from "./popover-hover-corridor.js";

interface TooltipController {
  reference: HTMLElement | undefined;
  reason: "hover" | "focus";
  update(data: DOMStringMap): void;
  open(trigger: HTMLElement, reason: "hover" | "focus"): void;
  close(): void;
  detach(trigger: HTMLElement): void;
  cancelClose(): void;
  leave(event: PointerEvent, delay: number): void;
  end(): void;
}
interface TriggerController {
  update(data: DOMStringMap): void;
  block(): void;
  end(): void;
}
interface Group {
  active?: TooltipController;
  warmUntil: number;
}
const roots = new WeakMap<HTMLElement, TooltipController>();
const triggers = new WeakMap<HTMLElement, TriggerController>();
const groups = new WeakMap<HTMLElement, Group>();
const mouseLike = (event: PointerEvent) =>
  event.pointerType === "mouse" || event.pointerType === "pen" || event.pointerType === "";
const provider = (trigger: HTMLElement) =>
  trigger.closest<HTMLElement>('[data-slot="tooltip-provider"]');
const groupFor = (trigger: HTMLElement) => {
  const node = provider(trigger);
  if (!node) return;
  let group = groups.get(node);
  if (!group) groups.set(node, (group = { warmUntil: 0 }));
  return group;
};
const numeric = (value: string | undefined, fallback: number) => {
  const n = Number(value ?? fallback);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
function timing(trigger: HTMLElement, key: "lensoHoverDelay" | "lensoCloseDelay") {
  let node: HTMLElement | null = trigger;
  while (node) {
    const value = Number(node.dataset[key]);
    if (Number.isFinite(value) && value >= 0) return value;
    node = node.parentElement?.closest<HTMLElement>('[data-slot="tooltip-provider"]') ?? null;
  }
  const raw = getComputedStyle(trigger)
    .getPropertyValue(
      key === "lensoHoverDelay" ? "--lenso-tooltip-delay" : "--lenso-tooltip-close-delay",
    )
    .trim();
  const value = parseFloat(raw);
  return Number.isFinite(value)
    ? Math.max(0, value * (raw.endsWith("ms") ? 1 : 1000))
    : key === "lensoHoverDelay"
      ? 1500
      : 500;
}
function rootFor(trigger: HTMLElement) {
  const root = trigger.ownerDocument.getElementById(trigger.dataset["lensoFor"] ?? "");
  return root ? roots.get(root) : undefined;
}
const enabled = (trigger: HTMLElement) =>
  trigger.isConnected &&
  trigger.dataset["lensoDisabled"] !== "true" &&
  !trigger.matches(':disabled,[aria-disabled="true"]');

function createTooltip(root: HTMLElement, initial: DOMStringMap): TooltipController {
  let data = initial;
  let disposed = false;
  let epoch = 0;
  let frame = 0;
  let closeTimer = 0;
  let stopTracking: (() => void) | undefined;
  let stopMaterial: (() => void) | undefined;
  let material: HTMLElement | undefined;
  let corridor: ReturnType<typeof createHoverCorridor> | undefined;
  let group: Group | undefined;
  let groupTimeout = 400;
  const attributes = new Map<Element, Map<string, string | null>>();
  const styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const attr = (node: Element, name: string, value: string | null) => {
    let saved = attributes.get(node);
    if (!saved) attributes.set(node, (saved = new Map()));
    if (!saved.has(name)) saved.set(name, node.getAttribute(name));
    if (value === null) {
      if (node.hasAttribute(name)) node.removeAttribute(name);
    } else if (node.getAttribute(name) !== value) node.setAttribute(name, value);
  };
  const style = (node: HTMLElement, name: string, value: string) => {
    let saved = styles.get(node);
    if (!saved) styles.set(node, (saved = new Map()));
    if (!saved.has(name))
      saved.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
    if (node.style.getPropertyValue(name) !== value) node.style.setProperty(name, value);
  };
  const original = (node: Element, name: string) =>
    attributes.get(node)?.has(name) ? attributes.get(node)!.get(name)! : node.getAttribute(name);
  const popup = () => root.querySelector<HTMLElement>(':scope > [data-slot="tooltip-popup"]');
  const isOpen = () => root.matches(":popover-open");
  const queries = [
    matchMedia("(forced-colors: active)"),
    matchMedia("(prefers-reduced-transparency: reduce)"),
    matchMedia("(prefers-contrast: more)"),
  ];
  const preferences = () => {
    const content = popup();
    const surface = content?.querySelector<HTMLElement>(':scope > [data-slot="tooltip-material"]');
    if (material !== surface) {
      stopMaterial?.();
      material = surface ?? undefined;
      stopMaterial =
        material && content ? anchoredMaterial(material, content, "tooltip") : undefined;
    }
    if (material)
      attr(
        material,
        "data-material-opaque",
        queries.some((q) => q.matches) ||
          material.closest("[data-contrast]")?.getAttribute("data-contrast") === "increased"
          ? ""
          : null,
      );
  };
  const describe = (trigger: HTMLElement, shown: boolean) => {
    const id = popup()?.id;
    const before = original(trigger, "aria-describedby");
    attr(
      trigger,
      "aria-describedby",
      shown && id
        ? [...new Set([...(before?.split(/\s+/).filter(Boolean) ?? []), id])].join(" ")
        : before,
    );
  };
  const accessible = (shown: boolean) => {
    attr(root, "inert", shown ? original(root, "inert") : "");
    const content = popup();
    if (content) {
      attr(content, "inert", shown ? original(content, "inert") : "");
      attr(content, "aria-hidden", shown ? original(content, "aria-hidden") : "true");
    }
  };
  const stopCorridor = () => {
    corridor?.dispose();
    corridor = undefined;
    root.ownerDocument.removeEventListener("pointermove", move);
  };
  const move = (event: PointerEvent) => {
    if (mouseLike(event)) corridor?.move(event);
  };
  const cancelClose = () => {
    clearTimeout(closeTimer);
    closeTimer = 0;
  };
  const position = async () => {
    const content = popup(),
      reference = controller.reference;
    if (disposed || !isOpen() || !reference?.isConnected || !content) return;
    const current = ++epoch;
    attr(root, "data-lenso-position-pending", "");
    const arrow = [...content.querySelectorAll<HTMLElement>('[data-slot="tooltip-arrow"]')].find(
      (n) => n.closest('[data-slot="tooltip-popup"]') === content,
    );
    let side = data["lensoSide"] ?? "top";
    if (side === "inline-start") side = data["lensoDirection"] === "rtl" ? "right" : "left";
    if (side === "inline-end") side = data["lensoDirection"] === "rtl" ? "left" : "right";
    const align = data["lensoAlign"] ?? "center",
      padding = numeric(data["lensoCollisionPadding"], 8),
      avoid = data["lensoCollisionAvoidance"] !== "false";
    const finite = (key: string, fallback: number) => {
      const n = Number(data[key] ?? fallback);
      return Number.isFinite(n) ? n : fallback;
    };
    const result = await computePosition(reference, root, {
      placement: `${side}${align === "center" ? "" : `-${align}`}` as Placement,
      strategy: "fixed",
      middleware: [
        offset({
          mainAxis: numeric(data["lensoSideOffset"], arrow ? 7 : 3),
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
            style(
              root,
              "--lenso-exact-tooltip-content-height",
              `${Math.max(0, availableHeight - 16)}px`,
            );
            style(root, "--anchor-width", `${rects.reference.width}px`);
            style(root, "--anchor-height", `${rects.reference.height}px`);
          },
        }),
        arrow && arrowMiddleware({ element: arrow, padding: 8 }),
      ],
    });
    if (disposed || current !== epoch || !isOpen() || controller.reference !== reference) return;
    style(root, "--lenso-exact-tooltip-x", `${result.x}px`);
    style(root, "--lenso-exact-tooltip-y", `${result.y}px`);
    attr(root, "data-lenso-positioned", "");
    attr(root, "data-lenso-position-pending", null);
    const resolved = result.placement.split("-")[0]!;
    attr(content, "data-side", resolved);
    attr(content, "data-align", result.placement.slice(resolved.length + 1) || "center");
    attr(content, "data-direction", data["lensoDirection"] ?? "ltr");
    let originX = "50%",
      originY = "50%";
    if (arrow) {
      attr(arrow, "data-side", resolved);
      attr(arrow, "data-direction", data["lensoDirection"] ?? "ltr");
      attr(arrow, "data-uncentered", result.middlewareData.arrow?.centerOffset ? "" : null);
      const { x, y } = result.middlewareData.arrow ?? {};
      style(arrow, "left", x === undefined ? "auto" : `${x}px`);
      style(arrow, "top", y === undefined ? "auto" : `${y}px`);
      if (x !== undefined) originX = `${x + arrow.offsetWidth / 2}px`;
      if (y !== undefined) originY = `${y + arrow.offsetHeight / 2}px`;
    }
    if (resolved === "top") originY = "100%";
    else if (resolved === "bottom") originY = "0%";
    else if (resolved === "left") originX = "100%";
    else originX = "0%";
    style(root, "--transform-origin", `${originX} ${originY}`);
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
    if (!controller.reference || !isOpen()) return;
    if (data["lensoDisableAnchorTracking"] === "true") void position();
    else stopTracking = autoUpdate(controller.reference, root, () => void position());
  };
  const finish = () => {
    ++epoch;
    cancelAnimationFrame(frame);
    cancelClose();
    stopCorridor();
    stopTracking?.();
    stopTracking = undefined;
    const content = popup();
    if (content) {
      attr(content, "data-open", null);
      attr(content, "data-starting-style", null);
      attr(content, "data-ending-style", "");
    }
    accessible(false);
    attr(root, "data-lenso-position-pending", null);
    if (controller.reference) {
      describe(controller.reference, false);
      triggers.get(controller.reference)?.block();
    }
    if (group?.active === controller) {
      group.active = undefined;
      group.warmUntil = performance.now() + groupTimeout;
    }
    root.ownerDocument.removeEventListener("keydown", keydown, true);
    root.ownerDocument.removeEventListener("pointerdown", outside, true);
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen()) {
      event.preventDefault();
      event.stopPropagation();
      controller.close();
    }
  };
  const outside = (event: PointerEvent) => {
    if (
      !(event.target instanceof Node) ||
      root.contains(event.target) ||
      controller.reference?.contains(event.target)
    )
      return;
    controller.close();
  };
  const beforeToggle = (event: ToggleEvent) => {
    if (event.target === root && event.newState === "closed") finish();
  };
  const enter = (event: PointerEvent) => {
    if (mouseLike(event)) cancelClose();
  };
  const leave = (event: PointerEvent) => {
    if (mouseLike(event) && controller.reason === "hover") {
      if (corridor) corridor.move(event);
      else
        controller.leave(
          event,
          controller.reference ? timing(controller.reference, "lensoCloseDelay") : 500,
        );
    }
  };
  const controller: TooltipController = {
    reference: undefined,
    reason: "hover",
    update(next) {
      data = next;
      preferences();
      accessible(isOpen());
      if (isOpen()) track();
    },
    open(trigger, reason) {
      if (disposed || !enabled(trigger) || !root.isConnected || !trigger.checkVisibility()) return;
      cancelClose();
      stopCorridor();
      if (controller.reference && controller.reference !== trigger)
        describe(controller.reference, false);
      controller.reference = trigger;
      controller.reason = reason;
      const nextGroup = groupFor(trigger);
      if (group?.active === controller && group !== nextGroup) group.active = undefined;
      group = nextGroup;
      groupTimeout = numeric(provider(trigger)?.dataset["lensoTimeout"], 400);
      if (group) {
        if (group.active !== controller) group.active?.close();
        group.active = controller;
      }
      attr(root, "data-lenso-open-reason", reason);
      accessible(true);
      describe(trigger, true);
      const content = popup();
      if (content && !isOpen()) {
        attr(content, "data-ending-style", null);
        attr(content, "data-starting-style", "");
        attr(content, "data-open", "");
      }
      if (!isOpen()) root.showPopover();
      track();
      root.ownerDocument.addEventListener("keydown", keydown, true);
      root.ownerDocument.addEventListener("pointerdown", outside, true);
    },
    close() {
      cancelClose();
      if (isOpen()) root.hidePopover();
      else finish();
    },
    detach(trigger) {
      if (controller.reference === trigger) {
        controller.close();
        controller.reference = undefined;
      }
      const saved = attributes.get(trigger);
      if (saved)
        for (const [name, value] of saved)
          if (value === null) trigger.removeAttribute(name);
          else trigger.setAttribute(name, value);
      attributes.delete(trigger);
    },
    cancelClose() {
      cancelClose();
    },
    leave(event, ms) {
      if (controller.reason !== "hover") return;
      cancelClose();
      stopCorridor();
      const schedule = () => {
        stopCorridor();
        cancelClose();
        if (ms) closeTimer = window.setTimeout(() => controller.close(), ms);
        else controller.close();
      };
      if (data["lensoDisableHoverablePopup"] === "true") {
        schedule();
        return;
      }
      corridor = createHoverCorridor({
        x: event.clientX,
        y: event.clientY,
        placement: popup()?.dataset["side"] ?? "top",
        reference: () => controller.reference,
        floating: root,
        hasOpenChild: () => false,
        onClose: schedule,
      });
      root.ownerDocument.addEventListener("pointermove", move);
      corridor.move(event);
    },
    end() {
      if (disposed) return;
      controller.close();
      disposed = true;
      for (const node of root.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-slot="tooltip-trigger"]',
      ))
        if (node.dataset["lensoFor"] === root.id) triggers.get(node)?.block();
      stopMaterial?.();
      observer.disconnect();
      for (const query of queries) query.removeEventListener("change", preferences);
      root.removeEventListener("beforetoggle", beforeToggle);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
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
  const observer = new MutationObserver(() => {
    preferences();
    accessible(isOpen());
    if (isOpen()) void position();
  });
  observer.observe(root, { childList: true, subtree: true });
  for (let node: HTMLElement | null = root; node; node = node.parentElement)
    observer.observe(node, { attributes: true, attributeFilter: ["data-contrast"] });
  for (const query of queries) query.addEventListener("change", preferences);
  root.addEventListener("beforetoggle", beforeToggle);
  root.addEventListener("pointerenter", enter);
  root.addEventListener("pointerleave", leave);
  preferences();
  accessible(isOpen());
  return controller;
}
function createTrigger(node: HTMLElement, initial: DOMStringMap): TriggerController {
  let data = initial,
    timer = 0,
    blocked = false,
    inside = false,
    pointer = false;
  const cancel = () => {
    clearTimeout(timer);
    timer = 0;
  };
  const close = () => {
    const root = rootFor(node);
    if (root?.reference === node) root.close();
  };
  const enter = (event: PointerEvent) => {
    inside = mouseLike(event);
    blocked = false;
    if (!inside || !enabled(node)) return;
    const root = rootFor(node);
    root?.cancelClose();
    if (root?.reference === node && node.matches(":focus-visible")) return;
    const group = groupFor(node),
      delay =
        group && (group.active || group.warmUntil > performance.now())
          ? 0
          : timing(node, "lensoHoverDelay");
    cancel();
    const show = () => {
      timer = 0;
      if (inside && !blocked && enabled(node)) rootFor(node)?.open(node, "hover");
    };
    if (delay) timer = window.setTimeout(show, delay);
    else show();
  };
  const leave = (event: PointerEvent) => {
    inside = false;
    cancel();
    const root = rootFor(node);
    if (root?.reference === node && root.reason === "hover")
      root.leave(event, timing(node, "lensoCloseDelay"));
  };
  const down = (event: PointerEvent) => {
    pointer = true;
    owner.block();
    if (!mouseLike(event) || data["lensoCloseOnClick"] !== "false") close();
  };
  const focus = () => {
    if (!pointer && enabled(node) && node.matches(":focus-visible")) {
      cancel();
      rootFor(node)?.open(node, "focus");
    }
    pointer = false;
  };
  const blur = () => {
    pointer = false;
    cancel();
    close();
  };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === "Tab") pointer = false;
  };
  const click = () => {
    if (data["lensoCloseOnClick"] !== "false") {
      owner.block();
      close();
    }
  };
  const owner: TriggerController = {
    update(next) {
      data = next;
      if (!enabled(node)) {
        owner.block();
        close();
      }
    },
    block() {
      blocked = true;
      cancel();
    },
    end() {
      cancel();
      rootFor(node)?.detach(node);
      observer.disconnect();
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("focus", focus);
      node.removeEventListener("blur", blur);
      node.removeEventListener("keydown", keydown);
      node.removeEventListener("click", click);
    },
  };
  const observer = new MutationObserver(() => {
    if (!enabled(node)) {
      owner.block();
      close();
    }
  });
  observer.observe(node, {
    attributes: true,
    attributeFilter: ["disabled", "aria-disabled", "data-lenso-disabled"],
  });
  node.addEventListener("pointerenter", enter);
  node.addEventListener("pointerleave", leave);
  node.addEventListener("pointerdown", down);
  node.addEventListener("focus", focus);
  node.addEventListener("blur", blur);
  node.addEventListener("keydown", keydown);
  node.addEventListener("click", click);
  return owner;
}
export function updateTooltip(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (data["lensoKind"] === "tooltip-positioner") {
    let owner = roots.get(node);
    if (!owner) {
      owner = createTooltip(node, data);
      roots.set(node, owner);
    }
    owner.update(data);
  } else if (roots.has(node)) {
    roots.get(node)!.end();
    roots.delete(node);
  }
  if (data["lensoKind"] === "tooltip-trigger") {
    let owner = triggers.get(node);
    if (!owner) {
      owner = createTrigger(node, data);
      triggers.set(node, owner);
    }
    owner.update(data);
  } else if (triggers.has(node)) {
    triggers.get(node)!.end();
    triggers.delete(node);
  }
}
export function endTooltip(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  triggers.get(node)?.end();
  triggers.delete(node);
  roots.get(node)?.end();
  roots.delete(node);
}
