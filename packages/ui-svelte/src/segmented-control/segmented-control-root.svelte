<script lang="ts">
  import { segmentedControlStyles } from "@lenso/tokens/segmented-control";
  import type { ComponentProps } from "svelte";
  import { SegmentedControl as Part } from "@ui-sdk/svelte/segmented-control";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(segmentedControlStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="segmented-control" {...rest} {...presentation} bind:value />
