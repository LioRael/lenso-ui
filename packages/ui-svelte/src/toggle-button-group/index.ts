import ToggleButtonGroupRoot from "./toggle-button-group-root.svelte";
import ToggleButtonGroupSeparator from "./toggle-button-group-separator.svelte";

export { ToggleButtonGroupRoot, ToggleButtonGroupSeparator };
export const ToggleButtonGroup: typeof ToggleButtonGroupRoot & {
  Root: typeof ToggleButtonGroupRoot;
  Separator: typeof ToggleButtonGroupSeparator;
} = Object.assign(ToggleButtonGroupRoot, {
  Root: ToggleButtonGroupRoot,
  Separator: ToggleButtonGroupSeparator,
});
