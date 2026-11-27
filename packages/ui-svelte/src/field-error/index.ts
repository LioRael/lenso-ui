import FieldErrorRoot from "./field-error-root.svelte";

export { FieldErrorRoot };
export const FieldError: typeof FieldErrorRoot & {
  Root: typeof FieldErrorRoot;
} = Object.assign(FieldErrorRoot, {
  Root: FieldErrorRoot,
});
