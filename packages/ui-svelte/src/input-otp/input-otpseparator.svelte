<script lang="ts">
  import { inputOTPStyles } from "@lenso/tokens/input-otp";
  import type { ComponentProps } from "svelte";
  import { OTPInputSeparator as Part } from "@ui-sdk/svelte/otp-input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(inputOTPStyles.separator, xstyle, className, style));
</script>

<Part data-lenso-slot="input-otp-separator" {...rest} {...presentation} />
