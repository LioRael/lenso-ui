<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { ColorPickerEyeDropper as Part } from "@ui-sdk/svelte/color-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(undefined, xstyle, className, style));
</script>

<Part data-lenso-slot="color-picker-eye-dropper" {...rest} {...presentation} />
