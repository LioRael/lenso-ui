import CloseButtonRoot from "./close-button.svelte";
import CloseButtonIcon from "./close-button-icon.svelte";

export { CloseButtonRoot, CloseButtonIcon };
export type { CloseButtonProps } from "./close-button.svelte";
export const CloseButton: typeof CloseButtonRoot & {
  Root: typeof CloseButtonRoot;
  Icon: typeof CloseButtonIcon;
} = Object.assign(CloseButtonRoot, {
  Root: CloseButtonRoot,
  Icon: CloseButtonIcon,
});
