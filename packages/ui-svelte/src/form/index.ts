import FormRoot from "./form-root.svelte";

export { FormRoot };
export const Form: typeof FormRoot & {
  Root: typeof FormRoot;
} = Object.assign(FormRoot, {
  Root: FormRoot,
});
