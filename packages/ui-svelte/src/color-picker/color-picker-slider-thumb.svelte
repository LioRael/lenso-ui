<script lang="ts">
  import { colorSliderStyles } from "@lenso/tokens/color-slider";
  import type { ComponentProps } from "svelte";
  import { ColorPickerSliderThumb as Part } from "@ui-sdk/svelte/color-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(colorSliderStyles.thumb, xstyle, className, style));
</script>

<Part data-lenso-slot="color-picker-slider-thumb" {...rest} {...presentation} />
