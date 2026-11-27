<script lang="ts">
  import { linkStyles } from "@lenso/tokens/link";
  import type { ComponentProps } from "svelte";
  import { ToolbarLink as Part } from "@ui-sdk/svelte/toolbar";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(linkStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="toolbar-link" {...rest} {...presentation} />
