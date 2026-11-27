<script lang="ts">
  import { menuItemStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { SelectItemIndicator as Part } from "@ui-sdk/svelte/select";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(menuItemStyles.indicator, xstyle, className, style));
</script>

<Part data-lenso-slot="select-item-indicator" {...rest} {...presentation} />
