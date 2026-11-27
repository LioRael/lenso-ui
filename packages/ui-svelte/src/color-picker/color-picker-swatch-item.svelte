<script lang="ts">
  import { colorSwatchPickerStyles } from "@lenso/tokens/color-swatch-picker";
  import type { ComponentProps } from "svelte";
  import { ColorPickerSwatchItem as Part } from "@ui-sdk/svelte/color-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(colorSwatchPickerStyles.item, xstyle, className, style));
</script>

<Part data-lenso-slot="color-picker-swatch-item" {...rest} {...presentation} />
