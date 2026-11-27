<script lang="ts">
  import { timeFieldStyles } from "@lenso/tokens/time-field";
  import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
  import type { ComponentProps } from "svelte";
  import { TimeInput as Part } from "@ui-sdk/svelte/time-input";
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
      [timeFieldStyles.root, dateInputGroupStyles.root, fullWidth && timeFieldStyles.fullWidth],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="time-field" {...rest} {...presentation} bind:value />
