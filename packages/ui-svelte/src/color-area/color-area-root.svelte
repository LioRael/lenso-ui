<script lang="ts">
  import { colorAreaStyles } from "@lenso/tokens/color-area";
  import type { ComponentProps } from "svelte";
  import { ColorPickerArea as Part } from "@ui-sdk/svelte/color-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([colorAreaStyles.root, colorAreaStyles.control], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="color-area" {...rest} {...presentation} />
