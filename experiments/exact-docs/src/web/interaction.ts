import type { DeliveryAssets } from "../delivery.ts";

/** Fetch hints only: Exact still activates, replays input and owns all root state. */
export function prepareInteraction() {
  const raw = document.querySelector("[data-docs-preload]")?.getAttribute("data-docs-preload");
  if (!raw) return;
  const assets: DeliveryAssets = JSON.parse(raw);
  const hinted = new Set<string>();
  function hint(file: string, style = false) {
    if (hinted.has(file)) return;
    hinted.add(file);
    const link = document.createElement("link");
    link.rel = style ? "preload" : "modulepreload";
    if (style) link.as = "style";
    link.href = new URL(file, document.baseURI).href;
    document.head.append(link);
  }
  function warm(event: Event) {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest("#exact-root [data-exact-on]")) return;
    for (const module of assets.modules) hint(module);
    for (const style of assets.styles) hint(style, true);
    for (const name of ["pointerover", "pointerdown", "focusin", "input"])
      document.removeEventListener(name, warm, true);
  }
  for (const name of ["pointerover", "pointerdown", "focusin", "input"])
    document.addEventListener(name, warm, true);
}
