<script lang="ts">
  import { autocompleteStyles } from "@lenso/tokens/autocomplete";
  import type { ComponentProps } from "svelte";
  import { AutocompleteInput as Part } from "@ui-sdk/svelte/autocomplete";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(autocompleteStyles.input, xstyle, className, style));
</script>

<Part data-lenso-slot="autocomplete-input" {...rest} {...presentation} />
