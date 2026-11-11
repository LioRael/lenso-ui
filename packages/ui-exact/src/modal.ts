import { setPageScrollLock as lock } from "./page-scroll-lock.js";
import { activeElement, modalOwner, modalTabbables } from "./modal-focus.js";

interface ModalController {
  sync(): void;
  destroy(): void;
}
const modals = new WeakMap<HTMLDialogElement, ModalController>();

function createModal(node: HTMLDialogElement): ModalController {
  const originalInert = node.getAttribute("inert");
  const originalHidden = node.getAttribute("aria-hidden");
  const accessible = (open: boolean) => {
    if (open) {
      if (originalInert === null) node.removeAttribute("inert");
      else node.setAttribute("inert", originalInert);
      if (originalHidden === null) node.removeAttribute("aria-hidden");
      else node.setAttribute("aria-hidden", originalHidden);
    } else {
      node.inert = true;
      node.setAttribute("aria-hidden", "true");
    }
  };
  let opener: HTMLElement | undefined;
  let frame = 0;
  let outsideDown = false;
  const parts = () =>
    [
      ...node.querySelectorAll<HTMLElement>(
        '[data-slot="modal-popup"], [data-slot="modal-backdrop"], [data-slot="alert-dialog-popup"], [data-slot="alert-dialog-backdrop"]',
      ),
    ].filter((part) => part.closest("dialog") === node);
  const mark = (name: string, active: boolean) => {
    for (const part of parts()) part.toggleAttribute(name, active);
  };
  const cancelFrame = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const sync = () => {
    accessible(node.open);
    lock(node, node.open && node.isConnected);
    if (!node.open) {
      cancelFrame();
      outsideDown = false;
    }
  };
  const beforeToggle = (event: ToggleEvent) => {
    if (event.target !== node) return;
    cancelFrame();
    const opening = event.newState === "open";
    if (
      opening &&
      document.activeElement instanceof HTMLElement &&
      !node.contains(document.activeElement)
    )
      opener = document.activeElement;
    accessible(opening);
    mark("data-ending-style", !opening);
    mark("data-starting-style", opening && !matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (opening)
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          mark("data-starting-style", false);
          frame = 0;
        });
      });
  };
  const cancel = (event: Event) => {
    if (event.target === node && node.dataset["lensoDismiss"] === "none") event.preventDefault();
  };
  const outside = (target: EventTarget | null) =>
    target === node ||
    (target instanceof Element &&
      [
        "modal-viewport",
        "modal-backdrop",
        "alert-dialog-viewport",
        "alert-dialog-backdrop",
      ].includes(target.getAttribute("data-slot") ?? "") &&
      target.closest("dialog") === node);
  const down = (event: PointerEvent) => {
    outsideDown = event.button === 0 && outside(event.target);
  };
  const up = (event: PointerEvent) => {
    const shouldClose =
      outsideDown && event.button === 0 && !event.defaultPrevented && outside(event.target);
    outsideDown = false;
    if (shouldClose && node.open && node.dataset["lensoDismiss"] === "any") {
      if (typeof node.requestClose === "function") node.requestClose();
      else if (node.dispatchEvent(new Event("cancel", { cancelable: true }))) node.close();
    }
  };
  const reset = () => {
    outsideDown = false;
  };
  const containTab = (event: KeyboardEvent) => {
    if (
      event.key !== "Tab" ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !node.open
    )
      return;
    const active = activeElement(node.ownerDocument);
    if (modalOwner(active) !== node) return;
    const items = modalTabbables(node);
    const destination = event.shiftKey ? items.at(-1) : items[0];
    if (
      !items.length ||
      active === node ||
      (event.shiftKey ? active === items[0] : active === items.at(-1))
    ) {
      event.preventDefault();
      (destination ?? node).focus();
    }
  };
  const observer = new MutationObserver(sync);
  observer.observe(node, { attributes: true, attributeFilter: ["open"] });
  node.addEventListener("beforetoggle", beforeToggle);
  node.addEventListener("cancel", cancel);
  node.addEventListener("keydown", containTab);
  node.addEventListener("pointerdown", down);
  node.addEventListener("pointerup", up);
  node.addEventListener("pointercancel", reset);
  sync();
  return {
    sync,
    destroy() {
      cancelFrame();
      observer.disconnect();
      node.removeEventListener("beforetoggle", beforeToggle);
      node.removeEventListener("cancel", cancel);
      node.removeEventListener("keydown", containTab);
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", reset);
      mark("data-starting-style", false);
      mark("data-ending-style", false);
      lock(node, false);
      const hadFocus = node.contains(document.activeElement);
      accessible(true);
      if (node.open) node.close();
      if (hadFocus && opener)
        queueMicrotask(() => {
          if (
            opener?.isConnected &&
            !document.querySelector("dialog:modal") &&
            !opener.closest("dialog:not([open]), [inert]")
          )
            opener.focus();
        });
    },
  };
}

export function updateModal(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (
    !(node instanceof HTMLDialogElement) ||
    !["modal", "alert-dialog"].includes(data["lensoKind"] ?? "")
  )
    return;
  const controller = modals.get(node);
  if (controller) controller.sync();
  else modals.set(node, createModal(node));
}

export function endModal(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLDialogElement)) return;
  modals.get(node)?.destroy();
  modals.delete(node);
}
