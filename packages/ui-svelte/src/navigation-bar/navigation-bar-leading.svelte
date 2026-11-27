<script lang="ts">
  import { navigationBarStyles } from "@lenso/tokens/navigation-bar";
  import type { ComponentProps } from "svelte";
  import { ToolbarGroup as Part } from "@ui-sdk/svelte/toolbar";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(navigationBarStyles.side, xstyle, className, style));
</script>

<Part data-lenso-slot="navigation-bar-leading" {...rest} {...presentation} />
