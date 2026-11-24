import { popupButtonStyles } from "@lenso/tokens/popup-button";
import { Button as SdkRoot } from "@ui-sdk/solid/button";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const PopupButtonRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "popup-button",
  () => popupButtonStyles.root,
);
export const PopupButtonIndicator = htmlPart(
  "span",
  "popup-button-indicator",
  () => popupButtonStyles.indicator,
);

export const PopupButton: typeof PopupButtonRoot & {
  Root: typeof PopupButtonRoot;
  Indicator: typeof PopupButtonIndicator;
} = Object.assign(PopupButtonRoot, {
  Root: PopupButtonRoot,
  Indicator: PopupButtonIndicator,
});
