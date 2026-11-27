<script lang="ts">
  import { disclosureStyles } from "@lenso/tokens/disclosure";
  import type { ComponentProps } from "svelte";
  import { Collapsible as Part } from "@ui-sdk/svelte/collapsible";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { open = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(disclosureStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="disclosure" {...rest} {...presentation} bind:open />
