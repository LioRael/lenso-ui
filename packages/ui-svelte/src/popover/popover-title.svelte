<script lang="ts">
  import { popoverStyles } from "@lenso/tokens/popover";
  import type { ComponentProps } from "svelte";
  import { PopoverTitle as Part } from "@ui-sdk/svelte/popover";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(popoverStyles.title, xstyle, className, style));
</script>

<Part data-lenso-slot="popover-title" {...rest} {...presentation} />
