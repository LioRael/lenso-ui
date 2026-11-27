<script lang="ts">
  import { datePickerStyles } from "@lenso/tokens/date-picker";
  import type { ComponentProps } from "svelte";
  import { DatePickerTrigger as Part } from "@ui-sdk/svelte/date-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(datePickerStyles.trigger, xstyle, className, style));
</script>

<Part data-lenso-slot="date-picker-trigger" {...rest} {...presentation} />
