<script lang="ts">
  import { listStyles as s } from "@lenso/tokens/list";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["li"] & StyleXProps = $props();
  const presentation = $derived(styled(s.separator, xstyle, className, style));
</script>

<li data-lenso-slot="list-separator" {...rest} {...presentation}>
  {@render children?.()}
</li>
