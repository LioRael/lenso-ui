<script lang="ts">
  import { inputOTPStyles } from "@lenso/tokens/input-otp";
  import type { ComponentProps } from "svelte";
  import { OTPInputSlot as Part } from "@ui-sdk/svelte/otp-input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { variant?: "primary" | "secondary" };
  let { variant, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [inputOTPStyles.slot, variant === "secondary" && inputOTPStyles.secondary],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="input-otp-slot" {...rest} {...presentation} />
