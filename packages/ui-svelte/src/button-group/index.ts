import ButtonGroupRoot from "./button-group-root.svelte";
import ButtonGroupSeparator from "./button-group-separator.svelte";

export { ButtonGroupRoot, ButtonGroupSeparator };
export const ButtonGroup: typeof ButtonGroupRoot & {
  Root: typeof ButtonGroupRoot;
  Separator: typeof ButtonGroupSeparator;
} = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
  Separator: ButtonGroupSeparator,
});
