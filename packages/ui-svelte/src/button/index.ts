import ButtonRoot from "./button.svelte";
import ButtonIcon from "./button-icon.svelte";
export type { ButtonProps } from "./button.svelte";
export { ButtonRoot, ButtonIcon };
export const Button = Object.assign(ButtonRoot, { Root: ButtonRoot, Icon: ButtonIcon });
