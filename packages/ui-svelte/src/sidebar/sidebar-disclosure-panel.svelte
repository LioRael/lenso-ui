<script lang="ts">
  import { sidebarStyles } from "@lenso/tokens/sidebar";
  import type { ComponentProps } from "svelte";
  import { CollapsiblePanel as Part } from "@ui-sdk/svelte/collapsible";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(sidebarStyles.disclosurePanel, xstyle, className, style));
</script>

<Part data-lenso-slot="sidebar-disclosure-panel" {...rest} {...presentation} />
