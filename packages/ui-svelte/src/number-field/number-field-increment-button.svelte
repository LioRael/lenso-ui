<script lang="ts">
  import { numberFieldStyles } from "@lenso/tokens/number-field";
  import type { ComponentProps } from "svelte";
  import { NumberInputIncrement as Part } from "@ui-sdk/svelte/number-input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([numberFieldStyles.button, numberFieldStyles.increment], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="number-field-increment-button" {...rest} {...presentation} />
