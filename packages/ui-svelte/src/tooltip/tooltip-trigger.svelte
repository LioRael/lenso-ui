<script lang="ts">
  import { tooltipStyles } from "@lenso/tokens/tooltip";
  import type { ComponentProps } from "svelte";
  import { TooltipTrigger as Part } from "@ui-sdk/svelte/tooltip";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(tooltipStyles.trigger, xstyle, className, style));
</script>

<Part data-lenso-slot="tooltip-trigger" {...rest} {...presentation} />
