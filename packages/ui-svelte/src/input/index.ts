import InputRoot from "./input-root.svelte";

export { InputRoot };
export const Input: typeof InputRoot & {
  Root: typeof InputRoot;
} = Object.assign(InputRoot, {
  Root: InputRoot,
});
