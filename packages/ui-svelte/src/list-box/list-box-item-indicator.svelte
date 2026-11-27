<script lang="ts">
  import { listBoxItemStyles } from "@lenso/tokens/list-box";
  import type { ComponentProps } from "svelte";
  import { ListboxItemIndicator as Part } from "@ui-sdk/svelte/listbox";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(listBoxItemStyles.indicator, xstyle, className, style));
</script>

<Part data-lenso-slot="list-box-item-indicator" {...rest} {...presentation} />
