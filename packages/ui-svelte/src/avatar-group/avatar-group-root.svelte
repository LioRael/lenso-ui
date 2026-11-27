<script lang="ts">
  import { avatarGroupStyles } from "@lenso/tokens/avatar-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    isGrid,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["div"], "isGrid"> & StyleXProps & { isGrid?: boolean } = $props();
  const presentation = $derived(
    styled([avatarGroupStyles.root, isGrid && avatarGroupStyles.grid], xstyle, className, style),
  );
</script>

<div data-lenso-slot="avatar-group" {...rest} {...presentation}>
  {@render children?.()}
</div>
