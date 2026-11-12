import { ownMenuPopup } from "./menu-parts.js";
import { menuSource, finishMenuPreviewReturn } from "./menu.js";
import { presentContextPreview } from "./context-preview-motion.js";
const roots = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function create(root: HTMLElement) {
  const view = root.ownerDocument.defaultView!;
  let disposed = false,
    stop: (() => void) | undefined,
    source: HTMLElement | undefined,
    preview: HTMLElement | undefined,
    popup: HTMLElement | undefined,
    frame = 0;
  const duration = {
      value: root.style.getPropertyValue("--lenso-context-return-duration"),
      priority: root.style.getPropertyPriority("--lenso-context-return-duration"),
    },
    marker = root.getAttribute("data-context-preview-retain"),
    state = root.getAttribute("data-context-preview-state");
  let popupStyles: Array<{ key: string; value: string; priority: string }> = [];
  const ownPreview = () =>
    [...root.querySelectorAll<HTMLElement>('[data-slot="context-menu-preview"]')].find(
      (n) =>
        n.closest('[role="menu"]') === root &&
        n.parentElement?.dataset["slot"] === "context-menu-layout",
    );
  const cancelDiscrete = () => {
    if (root.matches(":popover-open")) return;
    for (const a of root.getAnimations()) {
      const property = (a as Animation & { transitionProperty?: string }).transitionProperty;
      if (property === "display" || property === "overlay") a.cancel();
    }
    finishMenuPreviewReturn(root);
  };
  const clear = () => {
    stop?.();
    stop = undefined;
    source = undefined;
    if (popup) {
      for (const { key, value, priority } of popupStyles) {
        if (value) popup.style.setProperty(key, value, priority);
        else popup.style.removeProperty(key);
      }
    }
    popupStyles = [];
    preview = undefined;
    popup = undefined;
  };
  const finish = () => {
    if (disposed) return;
    root.setAttribute("data-context-preview-state", "returned");
    cancelDiscrete();
    clear();
  };
  const prepare = () => {
    const next = ownPreview(),
      nextPopup = ownMenuPopup(root),
      nextSource = menuSource(root);
    if (!next || !nextPopup || !nextSource?.isConnected) return;
    if (stop && source === nextSource && preview === next && popup === nextPopup) return;
    clear();
    preview = next;
    popup = nextPopup;
    source = nextSource;
    popupStyles = [
      "--lg-menu-popup-opacity",
      "--lg-menu-fade-transition",
      "--lenso-context-appearance-scale",
    ].map((key) => ({
      key,
      value: popup!.style.getPropertyValue(key),
      priority: popup!.style.getPropertyPriority(key),
    }));
    popup.style.setProperty("--lg-menu-popup-opacity", "1");
    popup.style.setProperty("--lg-menu-fade-transition", "none");
    popup.style.setProperty("--lenso-context-appearance-scale", "1");
    root.style.setProperty("--lenso-context-return-duration", "2000ms");
    root.setAttribute("data-context-preview-retain", "");
    root.setAttribute("data-context-preview-state", "opening");
    stop = presentContextPreview(preview, source, popup, finish, (state) =>
      root.setAttribute("data-context-preview-state", state),
    );
  };
  const before = (event: ToggleEvent) => {
    if (event.target !== root) return;
    if (event.newState === "open") prepare();
    else if (stop) {
      root.setAttribute("data-context-preview-state", "returning");
      view.cancelAnimationFrame(frame);
      frame = view.requestAnimationFrame(() => {
        frame = 0;
        if (!root.matches(":popover-open") && !root.checkVisibility({ visibilityProperty: true }))
          finish();
      });
    }
  };
  const sourceChanged = () => prepare();
  const sync = () => {
    if (disposed) return;
    const next = ownPreview(),
      nextPopup = ownMenuPopup(root);
    if (stop && (preview !== next || popup !== nextPopup || !source?.isConnected)) {
      clear();
      cancelDiscrete();
    }
    if (!next) {
      if (state === null) root.removeAttribute("data-context-preview-state");
      else root.setAttribute("data-context-preview-state", state);
      if (duration.value)
        root.style.setProperty(
          "--lenso-context-return-duration",
          duration.value,
          duration.priority,
        );
      else root.style.removeProperty("--lenso-context-return-duration");
      if (marker === null) root.removeAttribute("data-context-preview-retain");
      else root.setAttribute("data-context-preview-retain", marker);
    } else {
      root.style.setProperty("--lenso-context-return-duration", "2000ms");
      root.setAttribute("data-context-preview-retain", "");
      if (root.matches(":popover-open")) prepare();
    }
  };
  const observer = new MutationObserver(sync);
  observer.observe(root, { subtree: true, childList: true });
  root.addEventListener("beforetoggle", before);
  root.addEventListener("lenso-menu-source-change", sourceChanged);
  sync();
  return {
    sync,
    end() {
      if (disposed) return;
      disposed = true;
      view.cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("beforetoggle", before);
      root.removeEventListener("lenso-menu-source-change", sourceChanged);
      clear();
      cancelDiscrete();
      if (duration.value)
        root.style.setProperty(
          "--lenso-context-return-duration",
          duration.value,
          duration.priority,
        );
      else root.style.removeProperty("--lenso-context-return-duration");
      for (const [name, value] of [
        ["data-context-preview-retain", marker],
        ["data-context-preview-state", state],
      ]) {
        if (value === null) root.removeAttribute(name!);
        else root.setAttribute(name!, value!);
      }
      roots.delete(root);
    },
  };
}
export function updateContextMenuPreview(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.closest<HTMLElement>('[popover][role="menu"][data-lenso-context-menu="true"]');
  if (!root) return;
  if (!roots.has(root) && root.querySelector('[data-slot="context-menu-preview"]'))
    roots.set(root, create(root));
  roots.get(root)?.sync();
}
export function endContextMenuPreview(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement && roots.has(node)) roots.get(node)?.end();
}
