<script lang="ts">
  import { tabsStyles } from "@lenso/tokens/tabs";
  import type { ComponentProps } from "svelte";
  import { Tabs as Part } from "@ui-sdk/svelte/tabs";
  import { styled, type StyleXProps } from "../styled.js";

  import { setTabsOrientation } from "./context.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let {
    orientation = "horizontal",
    value = $bindable(),
    xstyle,
    class: className,
    style,
    ...rest
  }: Props = $props();
  setTabsOrientation(() => orientation);
  const presentation = $derived(
    styled([tabsStyles.root, tabsStyles[orientation]], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="tabs" {...rest} {...presentation} {orientation} bind:value />
