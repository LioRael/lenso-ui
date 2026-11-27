<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(styled(undefined, xstyle, className, style));
</script>

<span data-lenso-slot="avatar-group-count" {...rest} {...presentation}>
  {@render children?.()}
</span>
