<script lang="ts">
  import { segmentedControlStyles } from "@lenso/tokens/segmented-control";
  import type { ComponentProps } from "svelte";
  import { SegmentedControlItem as Part } from "@ui-sdk/svelte/segmented-control";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(segmentedControlStyles.item, xstyle, className, style));
</script>

<Part data-lenso-slot="segmented-control-item" {...rest} {...presentation} />
