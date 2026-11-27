<script lang="ts">
  import { autocompleteStyles } from "@lenso/tokens/autocomplete";
  import { selectStyles } from "@lenso/tokens/select";
  import { materialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { AutocompleteContent as Part } from "@ui-sdk/svelte/autocomplete";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        materialStyles.root,
        materialStyles.accessible,
        materialStyles.blur,
        selectStyles.positioner,
        autocompleteStyles.popover,
        selectStyles.typography,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="autocomplete-content" {...rest} {...presentation} />
