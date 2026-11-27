<script lang="ts">
  import { disclosureStyles } from "@lenso/tokens/disclosure";
  import type { ComponentProps } from "svelte";
  import { CollapsiblePanel as Part } from "@ui-sdk/svelte/collapsible";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(disclosureStyles.content, xstyle, className, style));
</script>

<Part data-lenso-slot="disclosure-content" {...rest} {...presentation} />
