<script lang="ts">
  import { accordionStyles } from "@lenso/tokens/accordion";
  import type { ComponentProps } from "svelte";
  import { Accordion as Part } from "@ui-sdk/svelte/accordion";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(accordionStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="accordion" {...rest} {...presentation} bind:value />
