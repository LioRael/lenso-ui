<script lang="ts">
  import { popoverStyles } from "@lenso/tokens/popover";
  import type { ComponentProps } from "svelte";
  import { PopoverDescription as Part } from "@ui-sdk/svelte/popover";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(popoverStyles.description, xstyle, className, style));
</script>

<Part data-lenso-slot="popover-description" {...rest} {...presentation} />
