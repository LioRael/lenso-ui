<script lang="ts">
  import { sliderStyles } from "@lenso/tokens/slider";
  import type { ComponentProps } from "svelte";
  import { FieldLabel as Part } from "@ui-sdk/svelte/field";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(sliderStyles.label, xstyle, className, style));
</script>

<Part data-lenso-slot="label" {...rest} {...presentation} />
