import SeparatorRoot from "./separator-root.svelte";

export { SeparatorRoot };
export const Separator: typeof SeparatorRoot & {
  Root: typeof SeparatorRoot;
} = Object.assign(SeparatorRoot, {
  Root: SeparatorRoot,
});
