<script lang="ts">
  import { datePickerStyles } from "@lenso/tokens/date-picker";
  import type { ComponentProps } from "svelte";
  import { DatePickerPreset as Part } from "@ui-sdk/svelte/date-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(datePickerStyles.accessory, xstyle, className, style));
</script>

<Part data-lenso-slot="date-picker-preset" {...rest} {...presentation} />
