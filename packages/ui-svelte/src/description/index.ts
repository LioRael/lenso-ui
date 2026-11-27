import DescriptionRoot from "./description-root.svelte";

export { DescriptionRoot };
export const Description: typeof DescriptionRoot & {
  Root: typeof DescriptionRoot;
} = Object.assign(DescriptionRoot, {
  Root: DescriptionRoot,
});
