<script lang="ts">
  import { popoverStyles } from "@lenso/tokens/popover";
  import type { ComponentProps } from "svelte";
  import { PopoverTrigger as Part } from "@ui-sdk/svelte/popover";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(popoverStyles.trigger, xstyle, className, style));
</script>

<Part data-lenso-slot="popover-trigger" {...rest} {...presentation} />
