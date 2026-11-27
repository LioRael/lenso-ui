<script lang="ts">
  import { selectStyles } from "@lenso/tokens/select";
  import type { ComponentProps } from "svelte";
  import { SelectItemText as Part } from "@ui-sdk/svelte/select";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(selectStyles.itemText, xstyle, className, style));
</script>

<Part data-lenso-slot="select-item-text" {...rest} {...presentation} />
