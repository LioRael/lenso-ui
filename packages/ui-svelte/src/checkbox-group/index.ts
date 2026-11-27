import CheckboxGroupRoot from "./checkbox-group-root.svelte";

export { CheckboxGroupRoot };
export const CheckboxGroup: typeof CheckboxGroupRoot & {
  Root: typeof CheckboxGroupRoot;
} = Object.assign(CheckboxGroupRoot, {
  Root: CheckboxGroupRoot,
});
