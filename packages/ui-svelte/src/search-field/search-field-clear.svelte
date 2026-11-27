<script lang="ts">
  import { searchFieldStyles } from "@lenso/tokens/search-field";
  import type { ComponentProps } from "svelte";
  import { InputClear as Part } from "@ui-sdk/svelte/input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(searchFieldStyles.clear, xstyle, className, style));
</script>

<Part data-lenso-slot="search-field-clear" {...rest} {...presentation} />
