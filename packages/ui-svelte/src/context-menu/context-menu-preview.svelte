<script lang="ts">
  import { contextMenuStyles } from "@lenso/tokens/context-menu";
  import { styled, type StyleXProps } from "../styled.js";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { getMenuSource } from "../menu/context.js";
  import { presentContextPreview } from "@lenso/glass/motion";
  const source = getMenuSource();
  function bindPreview(node: HTMLElement) {
    const panel = node.parentElement?.querySelector<HTMLElement>('[data-lenso-slot="menu-popup"]');
    if (panel && source?.current)
      return presentContextPreview(node, source.current, panel, () => {});
  }
  let {
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(contextMenuStyles.preview, xstyle, className, style));
</script>

<div
  {@attach bindPreview}
  aria-hidden="true"
  inert
  data-lenso-slot="context-menu-preview"
  {...rest}
  {...presentation}
>
  {@render children?.()}
</div>
