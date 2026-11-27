import ToggleButtonRoot from "./toggle-button-root.svelte";
import ToggleButtonIcon from "./toggle-button-icon.svelte";

export { ToggleButtonRoot, ToggleButtonIcon };
export const ToggleButton: typeof ToggleButtonRoot & {
  Root: typeof ToggleButtonRoot;
  Icon: typeof ToggleButtonIcon;
} = Object.assign(ToggleButtonRoot, {
  Root: ToggleButtonRoot,
  Icon: ToggleButtonIcon,
});
