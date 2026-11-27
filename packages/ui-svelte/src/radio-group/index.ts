import RadioGroupRoot from "./radio-group-root.svelte";

export { RadioGroupRoot };
export const RadioGroup: typeof RadioGroupRoot & {
  Root: typeof RadioGroupRoot;
} = Object.assign(RadioGroupRoot, {
  Root: RadioGroupRoot,
});
