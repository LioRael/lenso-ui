<script lang="ts">
  import { tabsStyles } from "@lenso/tokens/tabs";
  import type { ComponentProps } from "svelte";
  import { TabsTab as Part } from "@ui-sdk/svelte/tabs";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([tabsStyles.tab, tabsStyles.initialTab], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="tabs-tab" {...rest} {...presentation} />
