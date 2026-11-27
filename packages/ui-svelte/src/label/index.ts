import LabelRoot from "./label-root.svelte";

export { LabelRoot };
export const Label: typeof LabelRoot & {
  Root: typeof LabelRoot;
} = Object.assign(LabelRoot, {
  Root: LabelRoot,
});
