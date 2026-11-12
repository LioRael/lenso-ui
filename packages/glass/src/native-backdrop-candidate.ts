/** The optional shared renderer only accepts these pixel grids and blur recipes.
 * Native Chromium backdrop paint is already complete outside this subset. */
export function supportsSharedBackdrop(style: CSSStyleDeclaration, density: number): boolean {
  if (density !== 1 && density !== 2) return false;
  const blur = parseFloat(style.getPropertyValue("--lg-blur"));
  return style.getPropertyValue("--lg-material").trim() === "apple" && (blur === 3 || blur === 8);
}

export function isNativeBackdropCandidate(element: HTMLElement): boolean {
  if (devicePixelRatio !== 1 && devicePixelRatio !== 2) return false;
  return supportsSharedBackdrop(getComputedStyle(element), devicePixelRatio);
}

/** Keep unsupported native surfaces out of the copy scheduler. Reconsider on
 * density, stylesheet or inherited recipe changes without polling on scroll. */
export function watchNativeBackdropCandidate(element: HTMLElement, attach: () => () => void) {
  let stop: (() => void) | undefined;
  const sync = () => {
    if (isNativeBackdropCandidate(element)) stop ??= attach();
    else {
      stop?.();
      stop = undefined;
    }
  };
  const observer = new MutationObserver(sync);
  for (let node: HTMLElement | null = element; node; node = node.parentElement)
    observer.observe(node, { attributes: true });
  observer.observe(document.head, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  });
  const scheme = matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", sync);
  window.addEventListener("resize", sync);
  document.addEventListener("load", sync, true);
  element.addEventListener("transitionend", sync);
  element.addEventListener("animationend", sync);
  // A display move can change DPR without changing the window's CSS size.
  let density = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
  const changedDensity = () => {
    density.removeEventListener("change", changedDensity);
    density = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
    density.addEventListener("change", changedDensity);
    sync();
  };
  density.addEventListener("change", changedDensity);
  sync();
  return () => {
    observer.disconnect();
    scheme.removeEventListener("change", sync);
    window.removeEventListener("resize", sync);
    document.removeEventListener("load", sync, true);
    element.removeEventListener("transitionend", sync);
    element.removeEventListener("animationend", sync);
    density.removeEventListener("change", changedDensity);
    stop?.();
    stop = undefined;
  };
}
