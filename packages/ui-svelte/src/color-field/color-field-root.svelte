<script lang="ts">
  import { colorFieldStyles } from "@lenso/tokens/color-field";
  import type { ComponentProps } from "svelte";
  import { ColorPicker as Part } from "@ui-sdk/svelte/color-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(colorFieldStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="color-field" {...rest} {...presentation} bind:value />
