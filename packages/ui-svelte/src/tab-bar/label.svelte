<script lang="ts">
  import { tabBarStyles as s } from "@lenso/tokens/tab-bar";
  import type { Snippet } from "svelte";
  import { attributes } from "../styled.js";
  import { getTabBar } from "./context.js";

  let { icon, iconOnly, children }: { icon?: Snippet; iconOnly?: boolean; children?: Snippet } =
    $props();
  const bar = getTabBar();
  const layout = $derived(bar?.layout() ?? "phone");
</script>

{#if icon}
  <span
    data-tab-bar-content=""
    aria-hidden="true"
    {...attributes(
      s.icon,
      layout === "tablet" && !iconOnly && s.tabletIcon,
      layout === "vertical" && iconOnly && s.verticalIcon,
    )}
  >
    {@render icon()}
  </span>
{/if}
<span data-tab-bar-content="" {...attributes(s.label, iconOnly && s.visuallyHidden)}>
  {@render children?.()}
</span>
