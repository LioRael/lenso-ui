import { toggleButtonGroupStyles } from "@lenso/tokens/toggle-button-group";
import { ToggleGroup as SdkRoot } from "@ui-sdk/vue/toggle";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const ToggleButtonGroupRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "toggle-button-group",
  (props) => [
    toggleButtonGroupStyles.root,
    props.orientation === "vertical"
      ? toggleButtonGroupStyles.vertical
      : toggleButtonGroupStyles.horizontal,
  ],
);
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
