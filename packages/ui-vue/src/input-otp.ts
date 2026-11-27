import { inputOTPStyles } from "@lenso/tokens/input-otp";
import {
  OTPInput as SdkRoot,
  OTPInputGroup as SdkGroup,
  OTPInputSlot as SdkSlot,
  OTPInputSeparator as SdkSeparator,
} from "@ui-sdk/vue/otp-input";
import { sdkPart, type StyledPart } from "./parts.js";

export const InputOTPRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "input-otp",
  () => inputOTPStyles.root,
);
export const InputOTPGroup: StyledPart<typeof SdkGroup> = sdkPart(
  SdkGroup,
  "input-otp-group",
  () => inputOTPStyles.group,
);
export const InputOTPSlot: StyledPart<typeof SdkSlot, { variant?: "primary" | "secondary" }> =
  sdkPart<typeof SdkSlot, { variant?: "primary" | "secondary" }>(
    SdkSlot,
    "input-otp-slot",
    (props) => [inputOTPStyles.slot, props.variant === "secondary" && inputOTPStyles.secondary],
    "variant",
  );
export const InputOTPSeparator: StyledPart<typeof SdkSeparator> = sdkPart(
  SdkSeparator,
  "input-otp-separator",
  () => inputOTPStyles.separator,
);

export const InputOTP: typeof InputOTPRoot & {
  Root: typeof InputOTPRoot;
  Group: typeof InputOTPGroup;
  Slot: typeof InputOTPSlot;
  Separator: typeof InputOTPSeparator;
} = Object.assign(InputOTPRoot, {
  Root: InputOTPRoot,
  Group: InputOTPGroup,
  Slot: InputOTPSlot,
  Separator: InputOTPSeparator,
});
