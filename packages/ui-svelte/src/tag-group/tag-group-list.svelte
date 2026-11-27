<script lang="ts">
  import type { Snippet } from "svelte";
  import { getTagGroup, type TagGroupItem } from "./context.js";
  import { tagGroupStyles } from "@lenso/tokens/tag-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    item,
    ...rest
  }: SvelteHTMLElements["ul"] & StyleXProps & { item?: Snippet<[TagGroupItem]> } = $props();
  const group = getTagGroup();
  const presentation = $derived(styled(tagGroupStyles.list, xstyle, className, style));
</script>

<ul
  role={group ? "presentation" : undefined}
  data-lenso-slot="tag-group-list"
  {...rest}
  {...presentation}
>
  {#if item}
    {#each group?.items() ?? [] as entry (entry.key)}
      {@render item(entry)}
    {/each}
  {:else}
    {@render children?.()}
  {/if}
</ul>
