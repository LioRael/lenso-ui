<script lang="ts">
  import { comboBoxStyles } from "@lenso/tokens/combo-box";
  import type { ComponentProps } from "svelte";
  import { ComboboxChips as Part } from "@ui-sdk/svelte/combobox";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(comboBoxStyles.chips, xstyle, className, style));
</script>

<Part data-lenso-slot="combo-box-chips" {...rest} {...presentation} />
