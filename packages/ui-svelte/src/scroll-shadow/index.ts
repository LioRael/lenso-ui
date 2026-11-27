import ScrollShadowRoot from "./scroll-shadow-root.svelte";

export { ScrollShadowRoot };
export const ScrollShadow: typeof ScrollShadowRoot & {
  Root: typeof ScrollShadowRoot;
} = Object.assign(ScrollShadowRoot, {
  Root: ScrollShadowRoot,
});
