import GlassButtonRoot from "./glass-button.svelte";
import GlassButtonIcon from "./glass-button-icon.svelte";

export { GlassButtonRoot, GlassButtonIcon };
export type { GlassButtonProps } from "./glass-button.svelte";
export type { GlassButtonAppearance } from "./appearance.js";
export const GlassButton = Object.assign(GlassButtonRoot, {
  Root: GlassButtonRoot,
  Icon: GlassButtonIcon,
});
