<script lang="ts">
  import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
  import type { ComponentProps } from "svelte";
  import { DatePickerInput as Part } from "@ui-sdk/svelte/date-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([dateInputGroupStyles.root, dateInputGroupStyles.input], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="date-picker-input" {...rest} {...presentation} />
