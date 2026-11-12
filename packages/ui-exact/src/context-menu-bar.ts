import { ownMenuPopup } from "./menu-parts.js";
import { createSpring, type Spring } from "@lenso/glass/motion";
const selector = '[data-slot="context-menu-bar-owner"]';
const owners = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
const rowsSelector = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';
function create(root: HTMLElement, driver: HTMLInputElement) {
  const view = root.ownerDocument.defaultView!,
    doc = root.ownerDocument;
  const popup = ownMenuPopup(root);
  if (!popup) return;
  const orientation = root.getAttribute("aria-orientation"),
    previousOrigin = popup.style.transformOrigin,
    previousTransform = popup.style.transform,
    previousTransition = popup.style.transition;
  let disposed = false,
    frame = 0,
    rejectFrame = 0,
    spring: Spring | undefined,
    from: DOMRect | undefined,
    previous = driver.dataset["lensoMode"],
    focusPending = false;
  const reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = () => driver.dataset["lensoMode"] === "compact";
  const rows = () =>
    [...root.querySelectorAll<HTMLElement>(rowsSelector)].filter(
      (n) =>
        n.closest('[role="menu"]') === root &&
        !n.closest('[data-slot="context-menu-preview"]') &&
        !n.matches(':disabled,[aria-disabled="true"]') &&
        n.checkVisibility({ visibilityProperty: true }),
    );
  const restore = () => {
    spring?.stop();
    spring = undefined;
    popup.style.transform = previousTransform;
    popup.style.transformOrigin = previousOrigin;
    popup.style.transition = previousTransition;
    popup.removeAttribute("data-context-expanding");
  };
  const cancel = () => {
    view.cancelAnimationFrame(frame);
    view.cancelAnimationFrame(rejectFrame);
    frame = 0;
    rejectFrame = 0;
    from = undefined;
    restore();
  };
  const ready = (animate: boolean) => {
    view.cancelAnimationFrame(frame);
    let previousBox = "",
      attempts = 0;
    const measure = () => {
      if (disposed || !root.matches(":popover-open")) return;
      popup.style.transform = previousTransform;
      const b = popup.getBoundingClientRect(),
        box = [b.x, b.y, b.width, b.height, root.style.left, root.style.top].join();
      if (animate && from && !reduced.matches && b.width && b.height) {
        popup.style.transition = "none";
        popup.style.transformOrigin = "0 0";
        popup.style.transform = `translate(${from.x - b.x}px, ${from.y - b.y}px) scale(${from.width / b.width}, ${from.height / b.height})`;
        popup.setAttribute("data-context-expanding", "");
      }
      if (
        (box === previousBox && !root.hasAttribute("data-lenso-position-pending") && b.width > 0) ||
        ++attempts >= 8
      ) {
        frame = 0;
        if (focusPending) {
          const active = doc.activeElement;
          if (
            active === doc.body ||
            active === root ||
            (active instanceof HTMLElement &&
              root.contains(active) &&
              !active.checkVisibility({ visibilityProperty: true }))
          )
            rows()[0]?.focus({ preventScroll: true });
          focusPending = false;
        }
        const origin = from;
        from = undefined;
        if (!animate || !origin || reduced.matches) return;
        popup.style.transform = previousTransform;
        const target = popup.getBoundingClientRect();
        if (!target.width || !target.height) return;
        popup.style.transition = "none";
        popup.style.transformOrigin = "0 0";
        popup.setAttribute("data-context-expanding", "");
        // Preserve ContextMenuPopup's source 600/46 expansion spring and geometry formula.
        spring = createSpring(0, 600, 46, (t) => {
          if (disposed) return;
          popup.style.transform =
            t === 1
              ? previousTransform
              : `translate(${(origin.x - target.x) * (1 - t)}px, ${(origin.y - target.y) * (1 - t)}px) scale(${(origin.width + (target.width - origin.width) * t) / target.width}, ${(origin.height + (target.height - origin.height) * t) / target.height})`;
          if (t === 1) {
            popup.style.transformOrigin = previousOrigin;
            popup.style.transition = previousTransition;
            popup.removeAttribute("data-context-expanding");
          }
        });
        spring.paint();
        spring.set(1);
        return;
      }
      previousBox = box;
      frame = view.requestAnimationFrame(measure);
    };
    frame = view.requestAnimationFrame(measure);
  };
  const sync = () => {
    if (disposed) return;
    if (!root.matches(":popover-open") && (spring || frame)) cancel();
    const mode = driver.dataset["lensoMode"];
    root.setAttribute("aria-orientation", compact() ? "horizontal" : "vertical");
    if (mode !== previous) {
      const expanding = previous === "compact" && mode === "full";
      previous = mode;
      view.cancelAnimationFrame(rejectFrame);
      rejectFrame = 0;
      focusPending = true;
      restore();
      ready(expanding);
    }
  };
  const before = (event: ToggleEvent) => {
    if (event.target !== root) return;
    cancel();
    if (event.newState === "open") {
      focusPending = true;
      driver.value = "";
      driver.dispatchEvent(new view.Event("input", { bubbles: true }));
      sync();
      ready(false);
    }
  };
  const capture = (event: MouseEvent) => {
    if (
      !compact() ||
      event.defaultPrevented ||
      !(event.target instanceof Element) ||
      event.target.closest('[role="menu"]') !== root ||
      !event.target.closest("[data-lenso-context-expand]")
    )
      return;
    restore();
    from = popup.getBoundingClientRect();
    view.cancelAnimationFrame(rejectFrame);
    rejectFrame = view.requestAnimationFrame(() => {
      rejectFrame = view.requestAnimationFrame(() => {
        rejectFrame = 0;
        if (compact()) from = undefined;
      });
    });
  };
  const key = (event: KeyboardEvent) => {
    if (
      !compact() ||
      !root.matches(":popover-open") ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.isComposing ||
      !(event.target instanceof Element) ||
      event.target.closest('[role="menu"]') !== root ||
      event.target.matches('input,textarea,[contenteditable="true"]')
    )
      return;
    const rtl = getComputedStyle(root).direction === "rtl",
      items = rows(),
      index = items.indexOf(doc.activeElement as HTMLElement);
    const delta =
      event.key === (rtl ? "ArrowLeft" : "ArrowRight")
        ? 1
        : event.key === (rtl ? "ArrowRight" : "ArrowLeft")
          ? -1
          : 0;
    if (!delta && !["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!items.length) return;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : delta
            ? (index + delta + items.length) % items.length
            : -1;
    if (next >= 0) items[next]!.focus({ preventScroll: true });
  };
  const motion = () => {
    if (reduced.matches) restore();
  };
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-lenso-mode", "data-open", "data-ending-style"],
  });
  root.addEventListener("beforetoggle", before);
  root.addEventListener("click", capture, true);
  view.addEventListener("keydown", key, true);
  reduced.addEventListener("change", motion);
  sync();
  return {
    sync,
    end() {
      if (disposed) return;
      disposed = true;
      cancel();
      observer.disconnect();
      root.removeEventListener("beforetoggle", before);
      root.removeEventListener("click", capture, true);
      view.removeEventListener("keydown", key, true);
      reduced.removeEventListener("change", motion);
      if (orientation === null) root.removeAttribute("aria-orientation");
      else root.setAttribute("aria-orientation", orientation);
      owners.delete(root);
    },
  };
}
export function updateContextMenuBar(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.closest<HTMLElement>('[popover][role="menu"][data-lenso-context-menu="true"]');
  if (!root) return;
  const driver = [...root.querySelectorAll<HTMLInputElement>(selector)].find(
    (n) => n.closest('[role="menu"]') === root,
  );
  if (!driver) return;
  if (!owners.has(root)) {
    const owner = create(root, driver);
    if (owner) owners.set(root, owner);
  }
  owners.get(root)?.sync();
}
export function endContextMenuBar(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches('[popover][role="menu"]')
    ? node
    : node.closest<HTMLElement>('[popover][role="menu"]');
  if (root && (node === root || node.matches(selector))) owners.get(root)?.end();
}
