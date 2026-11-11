import type { DeliveryAssets } from "../delivery.ts";

/** Warm dependencies on intent; Exact activates, replays input and owns root state. */
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
  // A real query can fetch its scope while Exact downloads and replays the input.
  document.addEventListener(
    "input",
    (event) => {
      const target = event.target;
      if (
        !(target instanceof HTMLInputElement) ||
        !target.matches('[type="search"]') ||
        !target.value.trim()
      )
        return;
      if (!target.closest('#exact-root [data-docs-part="search"]')) return;
      const scope = target
        .closest("[data-docs-search-index]")
        ?.getAttribute("data-docs-search-index");
      const file = scope && assets.search?.[scope];
      if (file && !hinted.has(file)) {
        hinted.add(file);
        const script = document.createElement("script");
        script.type = "module";
        script.src = new URL(file, document.baseURI).href;
        script.fetchPriority = "low";
        document.head.append(script);
      }
    },
    true,
  );
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
