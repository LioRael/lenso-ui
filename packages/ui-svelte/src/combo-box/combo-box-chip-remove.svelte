<script lang="ts">
  import { comboBoxStyles } from "@lenso/tokens/combo-box";
  import type { ComponentProps } from "svelte";
  import { ComboboxChipRemove as Part } from "@ui-sdk/svelte/combobox";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(comboBoxStyles.chipRemove, xstyle, className, style));
</script>

<Part data-lenso-slot="combo-box-chip-remove" {...rest} {...presentation} />
