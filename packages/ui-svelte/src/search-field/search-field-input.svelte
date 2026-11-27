<script lang="ts">
  import { searchFieldGroupStyles } from "@lenso/tokens/search-field";
  import { inputStyles } from "@lenso/tokens/input";
  import type { ComponentProps } from "svelte";
  import { Input as Part } from "@ui-sdk/svelte/input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([inputStyles.input, searchFieldGroupStyles.input], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="search-field-input" {...rest} {...presentation} bind:value />
