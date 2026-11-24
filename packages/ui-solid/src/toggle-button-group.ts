import { toggleButtonGroupStyles } from "@lenso/tokens/toggle-button-group";
import { ToggleGroup as SdkRoot } from "@ui-sdk/solid/toggle";
import { htmlPart, sdkPart, type SlotProps } from "./parts.js";

export function ToggleButtonGroupRoot<T extends string = string>(
  props: Parameters<typeof SdkRoot<T>>[0] & SlotProps,
) {
  return sdkPart(SdkRoot<T>, "toggle-button-group", (props) => [
    toggleButtonGroupStyles.root,
    props.orientation === "vertical"
      ? toggleButtonGroupStyles.vertical
      : toggleButtonGroupStyles.horizontal,
  ])(props);
}
export const ToggleButtonGroupSeparator = htmlPart(
  "span",
  "toggle-button-group-separator",
  () => toggleButtonGroupStyles.separator,
);

export const ToggleButtonGroup: typeof ToggleButtonGroupRoot & {
  Root: typeof ToggleButtonGroupRoot;
  Separator: typeof ToggleButtonGroupSeparator;
} = Object.assign(ToggleButtonGroupRoot, {
  Root: ToggleButtonGroupRoot,
  Separator: ToggleButtonGroupSeparator,
});
