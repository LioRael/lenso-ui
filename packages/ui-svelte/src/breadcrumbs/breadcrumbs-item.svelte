<script lang="ts">
  import { breadcrumbsStyles } from "@lenso/tokens/breadcrumbs";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["li"] & StyleXProps = $props();
  const presentation = $derived(styled(breadcrumbsStyles.item, xstyle, className, style));
</script>

<li data-lenso-slot="breadcrumbs-item" {...rest} {...presentation}>
  {@render children?.()}
</li>
