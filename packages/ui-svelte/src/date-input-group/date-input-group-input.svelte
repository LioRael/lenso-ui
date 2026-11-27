<script lang="ts">
  import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
  import type { ComponentProps } from "svelte";
  import { DateInput as Part } from "@ui-sdk/svelte/date-input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(dateInputGroupStyles.input, xstyle, className, style));
</script>

<Part data-lenso-slot="date-input-group-input" {...rest} {...presentation} bind:value />
