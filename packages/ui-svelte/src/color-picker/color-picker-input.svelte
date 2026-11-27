<script lang="ts">
  import { inputStyles } from "@lenso/tokens/input";
  import type { ComponentProps } from "svelte";
  import { ColorPickerInput as Part } from "@ui-sdk/svelte/color-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(inputStyles.input, xstyle, className, style));
</script>

<Part data-lenso-slot="color-picker-input" {...rest} {...presentation} />
