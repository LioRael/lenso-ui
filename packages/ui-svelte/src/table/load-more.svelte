<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    colSpan = 1,
    onLoadMore,
    loading,
    hasMore = true,
    children,
    xstyle,
    class: className,
    style,
    ...rest
  }: SvelteHTMLElements["tr"] &
    StyleXProps & {
      colSpan?: number;
      onLoadMore?: () => void;
      loading?: boolean;
      hasMore?: boolean;
    } = $props();
  let node: HTMLTableRowElement | undefined = $state();
  $effect(() => {
    const load = onLoadMore;
    if (!node || loading || !hasMore || !load) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) load();
    });
    observer.observe(node);
    return () => observer.disconnect();
  });
  const presentation = $derived(styled(undefined, xstyle, className, style));
</script>

<tr
  data-lenso-slot="table-load-more"
  {...rest}
  {...presentation}
  bind:this={node}
  aria-busy={loading || undefined}
>
  <td colspan={colSpan}>{@render children?.()}</td>
</tr>
