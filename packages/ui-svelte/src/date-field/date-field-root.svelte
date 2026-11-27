<script lang="ts">
  import { dateFieldStyles } from "@lenso/tokens/date-field";
  import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
  import type { ComponentProps } from "svelte";
  import { DateInput as Part } from "@ui-sdk/svelte/date-input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { fullWidth?: boolean };
  let {
    fullWidth,
    value = $bindable(),
    xstyle,
    class: className,
    style,
    ...rest
  }: Props = $props();
  const presentation = $derived(
    styled(
      [dateFieldStyles.root, dateInputGroupStyles.root, fullWidth && dateFieldStyles.fullWidth],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="date-field" {...rest} {...presentation} bind:value />
