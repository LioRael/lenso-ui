import { setPageScrollLock } from "./page-scroll-lock.js";

/** Base UI anchored-menu modality: pointer isolation and input-dependent scrolling, with Tab exit. */
export function menuModal(root: HTMLElement) {
  const doc = root.ownerDocument;
  const marker = root.getAttribute("data-lenso-menu-modal-active");
  const clip = root.style.getPropertyValue("--lenso-exact-menu-backdrop-clip"),
    priority = root.style.getPropertyPriority("--lenso-exact-menu-backdrop-clip");
  let active = false,
    trigger: HTMLElement | undefined,
    input = "programmatic",
    openingInput = "programmatic",
    releaseTimer = 0,
    outsideDown = false;
  const isTrigger = (target: EventTarget | null) =>
    target instanceof Element &&
    target.closest("button[popovertarget]")?.getAttribute("popovertarget") === root.id;
  const inputDown = (event: PointerEvent) => {
    if (isTrigger(event.target)) input = event.pointerType || "mouse";
  };
  const inputKey = (event: KeyboardEvent) => {
    if (isTrigger(event.target) && ["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key))
      input = "keyboard";
  };
  const paint = () => {
    if (!active) return;
    if (trigger?.isConnected) {
      const rect = trigger.getBoundingClientRect();
      root.style.setProperty(
        "--lenso-exact-menu-backdrop-clip",
        `polygon(0% 0%,100% 0%,100% 100%,0% 100%,0% 0%,${rect.left}px ${rect.top}px,${rect.left}px ${rect.bottom}px,${rect.right}px ${rect.bottom}px,${rect.right}px ${rect.top}px,${rect.left}px ${rect.top}px)`,
      );
    }
    setPageScrollLock(
      root,
      openingInput !== "touch" ||
        (root.offsetWidth > 0 && root.offsetWidth >= doc.documentElement.clientWidth - 20),
    );
  };
  const backdrop = (event: Event) =>
    event.target instanceof Element &&
    event.target.closest('[data-slot="menu-backdrop"]')?.parentElement === root;
  const down = (event: PointerEvent) => {
    outsideDown = active && backdrop(event);
    if (outsideDown) event.preventDefault();
  };
  const up = (event: PointerEvent) => {
    const dismiss = outsideDown && active && backdrop(event);
    outsideDown = false;
    if (dismiss) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (root.matches(":popover-open")) root.hidePopover();
    }
  };
  const reset = () => {
    outsideDown = false;
  };
  const resize = new ResizeObserver(paint);
  const restoreMarker = () => {
    if (marker === null) root.removeAttribute("data-lenso-menu-modal-active");
    else root.setAttribute("data-lenso-menu-modal-active", marker);
  };
  doc.addEventListener("pointerdown", inputDown, true);
  doc.addEventListener("keydown", inputKey, true);
  root.addEventListener("pointerdown", down, true);
  root.addEventListener("pointerup", up, true);
  root.addEventListener("pointercancel", reset, true);
  return {
    sync(shown: boolean, opener: HTMLElement | undefined) {
      trigger = opener?.closest<HTMLElement>('[data-slot="menu-bar"]') ?? opener;
      const wanted =
        shown && root.dataset["lensoModal"] === "true" && root.dataset["lensoSubmenu"] !== "true";
      if (wanted) {
        clearTimeout(releaseTimer);
        if (!active) {
          openingInput = input;
          active = true;
          root.setAttribute("data-lenso-menu-modal-active", "");
          resize.observe(root);
          if (trigger) resize.observe(trigger);
          doc.defaultView?.addEventListener("resize", paint);
          doc.addEventListener("scroll", paint, true);
        }
        paint();
      } else if (active) {
        active = false;
        outsideDown = false;
        restoreMarker();
        resize.disconnect();
        doc.defaultView?.removeEventListener("resize", paint);
        doc.removeEventListener("scroll", paint, true);
        const retain =
          !shown &&
          ["mouse", "keyboard"].includes(openingInput) &&
          CSS.supports("overlay", "auto") &&
          !matchMedia("(prefers-reduced-motion: reduce)").matches;
        clearTimeout(releaseTimer);
        if (retain) releaseTimer = window.setTimeout(() => setPageScrollLock(root, false), 160);
        else setPageScrollLock(root, false);
      }
    },
    end() {
      active = false;
      clearTimeout(releaseTimer);
      setPageScrollLock(root, false);
      resize.disconnect();
      restoreMarker();
      if (clip) root.style.setProperty("--lenso-exact-menu-backdrop-clip", clip, priority);
      else root.style.removeProperty("--lenso-exact-menu-backdrop-clip");
      doc.removeEventListener("pointerdown", inputDown, true);
      doc.removeEventListener("keydown", inputKey, true);
      doc.defaultView?.removeEventListener("resize", paint);
      doc.removeEventListener("scroll", paint, true);
      root.removeEventListener("pointerdown", down, true);
      root.removeEventListener("pointerup", up, true);
      root.removeEventListener("pointercancel", reset, true);
    },
  };
}
