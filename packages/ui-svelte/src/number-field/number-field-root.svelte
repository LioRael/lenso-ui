<script lang="ts">
  import { numberFieldStyles, numberFieldGroupStyles } from "@lenso/tokens/number-field";
  import type { ComponentProps } from "svelte";
  import { NumberInput as Part } from "@ui-sdk/svelte/number-input";
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
      [numberFieldStyles.root, fullWidth && numberFieldGroupStyles.fullWidth],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="number-field" {...rest} {...presentation} bind:value />
