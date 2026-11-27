<script lang="ts">
  import { autocompleteFieldStyles } from "@lenso/tokens/autocomplete";
  import type { ComponentProps } from "svelte";
  import { AutocompleteClear as Part } from "@ui-sdk/svelte/autocomplete";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(autocompleteFieldStyles.clear, xstyle, className, style));
</script>

<Part data-lenso-slot="autocomplete-clear-button" {...rest} {...presentation} />
