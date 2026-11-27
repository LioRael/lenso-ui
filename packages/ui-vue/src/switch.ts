import { switchStyles } from "@lenso/tokens/switch";
import { Switch as SdkRoot, SwitchThumb as SdkThumb } from "@ui-sdk/vue/switch";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const SwitchRoot: StyledPart<typeof SdkRoot, { size?: "sm" | "md" | "lg" }> = sdkPart<
  typeof SdkRoot,
  { size?: "sm" | "md" | "lg" }
>(
  SdkRoot,
  "switch",
  (props) => [
    switchStyles.root,
    props.size === "sm" && switchStyles.rootSm,
    props.size === "lg" && switchStyles.rootLg,
  ],
  "size",
);
export const SwitchContent = htmlPart("span", "switch-content", () => switchStyles.content);
export const SwitchControl = htmlPart("span", "switch-control", () => switchStyles.control);
export const SwitchTrack = htmlPart("span", "switch-track", () => switchStyles.track);
export const SwitchThumb: StyledPart<typeof SdkThumb> = sdkPart(
  SdkThumb,
  "switch-thumb",
  () => switchStyles.thumb,
);
export const SwitchIcon = htmlPart("span", "switch-icon", () => switchStyles.icon);

export const Switch: typeof SwitchRoot & {
  Root: typeof SwitchRoot;
  Content: typeof SwitchContent;
  Control: typeof SwitchControl;
  Track: typeof SwitchTrack;
  Thumb: typeof SwitchThumb;
  Icon: typeof SwitchIcon;
} = Object.assign(SwitchRoot, {
  Root: SwitchRoot,
  Content: SwitchContent,
  Control: SwitchControl,
  Track: SwitchTrack,
  Thumb: SwitchThumb,
  Icon: SwitchIcon,
});
