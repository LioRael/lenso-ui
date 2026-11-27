<script lang="ts">
  import { tabsStyles } from "@lenso/tokens/tabs";
  import type { ComponentProps } from "svelte";
  import { SegmentedControlIndicator as Part } from "@ui-sdk/svelte/segmented-control";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(tabsStyles.indicator, xstyle, className, style));
</script>

<Part data-lenso-slot="segmented-control-indicator" {...rest} {...presentation} />
