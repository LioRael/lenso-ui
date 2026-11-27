<script module lang="ts">
  export type SectionIndexProps = ComponentProps<typeof sectionIndexParts.Root> & StyleXProps;
</script>

<script lang="ts">
  import { sectionIndexStyles } from "@lenso/tokens/section-index";
  import type { ComponentProps } from "svelte";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import { sectionIndexParts } from "./parts.js";

  const { Root, Item } = sectionIndexParts;
  let {
    items,
    children: content,
    xstyle,
    class: className,
    style,
    ...rest
  }: SectionIndexProps = $props();
  const presentation = $derived(
    styled(
      [sectionIndexStyles.root, rest.disabled && sectionIndexStyles.disabled],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Root
  aria-label="Section index"
  data-lenso-slot="section-index"
  {items}
  {...rest}
  {...presentation}
>
  {#snippet children(state)}
    {#if content}
      {@render content(state)}
    {:else}
      {#each items as item (item.value)}
        <Item
          value={item.value}
          href={item.href}
          disabled={item.disabled}
          data-lenso-slot="section-index-item"
          {...attributes(sectionIndexStyles.item)}
        >
          {item.label}
        </Item>
      {/each}
    {/if}
  {/snippet}
</Root>
