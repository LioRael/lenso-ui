<script module lang="ts">
  export type TabListContainerProps = SvelteHTMLElements["div"] &
    StyleXProps & {
      overflowLabel?: string;
    };
</script>

<script lang="ts">
  import { bindTabsOverflow, type OverflowTab } from "@lenso/glass/motion";
  import { menuStyles } from "@lenso/tokens/menu";
  import { tabsStyles } from "@lenso/tokens/tabs";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { Menu } from "../menu/index.js";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import { getTabsOrientation } from "./context.js";

  let {
    overflowLabel = "More tabs",
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: TabListContainerProps = $props();
  const orientation = getTabsOrientation();
  const vertical = $derived(orientation?.() === "vertical");
  let host: HTMLDivElement | undefined = $state();
  let overflow: OverflowTab[] = $state.raw([]);
  let selectedFromMenu = false;
  const presentation = $derived(
    styled(
      [
        tabsStyles.listContainer,
        vertical ? tabsStyles.verticalContainer : tabsStyles.overflowContainer,
      ],
      xstyle,
      className,
      style,
    ),
  );
  $effect(() => {
    if (host && !vertical)
      return bindTabsOverflow(host, (items) => {
        overflow = items;
      });
    overflow = [];
  });

  function focusSelected() {
    if (!selectedFromMenu) return undefined;
    const active = host?.querySelector<HTMLElement>(
      '[data-lenso-slot="tabs-tab"][aria-selected="true"]',
    );
    active?.removeAttribute("data-tabs-overflow");
    return active;
  }
</script>

<div data-lenso-slot="tabs-list-container" {...rest} {...presentation} bind:this={host}>
  {#if vertical}
    {@render children?.()}
  {:else}
    <div data-lenso-slot="tabs-overflow-row" {...attributes(tabsStyles.overflowRow)}>
      {@render children?.()}
      {#if overflow.length}
        <Menu
          onOpenChange={(open) => {
            if (open) selectedFromMenu = false;
          }}
        >
          <Menu.Trigger
            aria-label={overflowLabel}
            xstyle={[menuStyles.expand, tabsStyles.overflowTrigger]}
          >
            <span aria-hidden="true">⋯</span>
          </Menu.Trigger>
          <Menu.Content
            aria-label={overflowLabel}
            align="end"
            sideOffset={8}
            finalFocus={focusSelected}
          >
            {#each overflow as item (item.node)}
              <Menu.Item
                disabled={item.disabled}
                onclick={() => {
                  selectedFromMenu = true;
                  item.node.click();
                }}
              >
                {item.label}
              </Menu.Item>
            {/each}
          </Menu.Content>
        </Menu>
      {/if}
    </div>
  {/if}
</div>
