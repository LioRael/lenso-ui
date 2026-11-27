<script lang="ts">
  import { tabsStyles } from "@lenso/tokens/tabs";
  import type { ComponentProps } from "svelte";
  import { TabsPanel as Part } from "@ui-sdk/svelte/tabs";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(tabsStyles.panel, xstyle, className, style));
</script>

<Part data-lenso-slot="tab-panel" {...rest} {...presentation} />
