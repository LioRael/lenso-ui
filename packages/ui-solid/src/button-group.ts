import { buttonGroupStyles } from "@lenso/tokens/button-group";
import { htmlPart } from "./parts.js";

export const ButtonGroupRoot = htmlPart<
  "div",
  { orientation?: "horizontal" | "vertical"; fullWidth?: boolean; isDetached?: boolean }
>(
  "div",
  "button-group",
  (props) => [
    buttonGroupStyles.root,
    buttonGroupStyles[props.orientation ?? "horizontal"],
    props.fullWidth && buttonGroupStyles.fullWidth,
    props.isDetached && buttonGroupStyles.detached,
  ],
  "orientation",
  "fullWidth",
  "isDetached",
);
export const ButtonGroupSeparator = htmlPart(
  "span",
  "button-group-separator",
  () => buttonGroupStyles.separator,
);

export const ButtonGroup = Object.assign(ButtonGroupRoot, {
  Root: ButtonGroupRoot,
  Separator: ButtonGroupSeparator,
});
