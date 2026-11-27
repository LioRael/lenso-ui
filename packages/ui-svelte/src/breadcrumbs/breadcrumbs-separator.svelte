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
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(breadcrumbsStyles.separator, xstyle, className, style));
</script>

<span data-lenso-slot="breadcrumbs-separator" {...rest} {...presentation}>
  {@render children?.()}
</span>
