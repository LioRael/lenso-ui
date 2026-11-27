<script lang="ts">
  import { fieldsetStyles } from "@lenso/tokens/fieldset";
  import type { ComponentProps } from "svelte";
  import { FieldLegend as Part } from "@ui-sdk/svelte/field";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(fieldsetStyles.legend, xstyle, className, style));
</script>

<Part data-lenso-slot="fieldset-legend" {...rest} {...presentation} />
