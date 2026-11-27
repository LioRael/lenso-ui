import TextAreaRoot from "./text-area-root.svelte";

export { TextAreaRoot };
export const TextArea: typeof TextAreaRoot & {
  Root: typeof TextAreaRoot;
} = Object.assign(TextAreaRoot, {
  Root: TextAreaRoot,
});
