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
  }: SvelteHTMLElements["ol"] & StyleXProps = $props();
  const presentation = $derived(styled(breadcrumbsStyles.root, xstyle, className, style));
</script>

<ol data-lenso-slot="breadcrumbs" {...rest} {...presentation}>
  {@render children?.()}
</ol>
