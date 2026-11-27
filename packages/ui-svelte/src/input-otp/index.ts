import InputOTPRoot from "./input-otproot.svelte";
import InputOTPGroup from "./input-otpgroup.svelte";
import InputOTPSlot from "./input-otpslot.svelte";
import InputOTPSeparator from "./input-otpseparator.svelte";

export { InputOTPRoot, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
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
