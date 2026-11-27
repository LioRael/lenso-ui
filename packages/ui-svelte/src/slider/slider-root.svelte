<script lang="ts">
  import { sliderStyles } from "@lenso/tokens/slider";
  import type { ComponentProps } from "svelte";
  import { Slider as Part } from "@ui-sdk/svelte/slider";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(sliderStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="slider" {...rest} {...presentation} bind:value />
