<script lang="ts">
  import { listBoxStyles } from "@lenso/tokens/list-box";
  import type { ComponentProps } from "svelte";
  import { Listbox as Part } from "@ui-sdk/svelte/listbox";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(listBoxStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="list-box" {...rest} {...presentation} bind:value />
