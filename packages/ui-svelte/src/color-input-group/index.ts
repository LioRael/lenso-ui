import ColorInputGroupPrefix from "./color-input-group-prefix.svelte";
export { ColorInputGroupPrefix };
import ColorInputGroupSuffix from "./color-input-group-suffix.svelte";
export { ColorInputGroupSuffix };
import ColorInputGroupRoot from "./color-input-group-root.svelte";
import ColorInputGroupInput from "./color-input-group-input.svelte";
import ColorInputGroupChannelInput from "./color-input-group-channel-input.svelte";

export { ColorInputGroupRoot, ColorInputGroupInput, ColorInputGroupChannelInput };
export const ColorInputGroup: typeof ColorInputGroupRoot & {
  Prefix: typeof ColorInputGroupPrefix;
  Suffix: typeof ColorInputGroupSuffix;
  Root: typeof ColorInputGroupRoot;
  Input: typeof ColorInputGroupInput;
  ChannelInput: typeof ColorInputGroupChannelInput;
} = Object.assign(ColorInputGroupRoot, {
  Prefix: ColorInputGroupPrefix,
  Suffix: ColorInputGroupSuffix,
  Root: ColorInputGroupRoot,
  Input: ColorInputGroupInput,
  ChannelInput: ColorInputGroupChannelInput,
});
