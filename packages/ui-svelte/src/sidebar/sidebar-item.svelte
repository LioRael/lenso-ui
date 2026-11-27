<script lang="ts">
  import { sidebarStyles } from "@lenso/tokens/sidebar";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    selected,
    indent,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["a"], "selected" | "indent"> &
    StyleXProps & { selected?: boolean; indent?: number } = $props();
  const presentation = $derived(
    styled(
      [sidebarStyles.item, selected && sidebarStyles.selected, sidebarStyles.indent(indent ?? 0)],
      xstyle,
      className,
      style,
    ),
  );
</script>

<a data-lenso-slot="sidebar-item" {...rest} {...presentation}>
  {@render children?.()}
</a>
