import { GlassButtonIcon } from "../glass-button/index.js";
import GlassToggleButtonRoot from "./glass-toggle-button.svelte";

export { GlassToggleButtonRoot };
export type { GlassToggleButtonProps } from "./glass-toggle-button.svelte";
export const GlassToggleButton = Object.assign(GlassToggleButtonRoot, {
  Root: GlassToggleButtonRoot,
  Icon: GlassButtonIcon,
});
