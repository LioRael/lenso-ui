<script module lang="ts">
  export type TabBarButtonProps = ComponentProps<typeof Action> & {
    icon?: Snippet;
    iconOnly?: boolean;
  };
</script>

<script lang="ts">
  import { tabBarStyles as s } from "@lenso/tokens/tab-bar";
  import type { ComponentProps, Snippet } from "svelte";
  import Action from "./action.svelte";
  import { getSeparate, getTabBar } from "./context.js";
  import Item from "./item.svelte";
  import Label from "./label.svelte";

  let { icon, iconOnly, children: content, xstyle, ...rest }: TabBarButtonProps = $props();
  const bar = getTabBar();
  const separate = getSeparate();
  const layout = $derived(bar?.layout() ?? "phone");
  const hideLabel = $derived(iconOnly ?? (layout === "vertical" || Boolean(separate?.())));
</script>

<Item
  xstyle={[layout === "tablet" && s.tabletItemContainer, separate?.() && s.separateItemContainer]}
>
  <Action
    {...rest}
    data-tab-bar-item=""
    xstyle={[
      layout === "tablet" && s.tabletItem,
      layout === "vertical" && s.verticalItem,
      hideLabel && s.iconOnlyItem,
      xstyle,
    ]}
  >
    {#snippet children(state)}
      <Label {icon} iconOnly={hideLabel}>
        {@render content?.(state)}
      </Label>
    {/snippet}
  </Action>
</Item>
