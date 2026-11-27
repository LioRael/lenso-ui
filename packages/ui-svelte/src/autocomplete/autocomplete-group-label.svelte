<script lang="ts">
  import { menuSectionStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { AutocompleteGroupLabel as Part } from "@ui-sdk/svelte/autocomplete";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(menuSectionStyles.label, xstyle, className, style));
</script>

<Part data-lenso-slot="autocomplete-group-label" {...rest} {...presentation} />
