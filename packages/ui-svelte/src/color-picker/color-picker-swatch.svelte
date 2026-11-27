<script lang="ts">
  import { colorSwatchStyles } from "@lenso/tokens/color-swatch";
  import type { ComponentProps } from "svelte";
  import { ColorPickerSwatch as Part } from "@ui-sdk/svelte/color-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(colorSwatchStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="color-picker-swatch" {...rest} {...presentation} />
