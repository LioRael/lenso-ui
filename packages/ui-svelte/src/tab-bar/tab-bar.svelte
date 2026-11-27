<script module lang="ts">
  export type TabBarRootProps = SvelteHTMLElements["nav"] &
    StyleXProps & {
      elastic?: boolean;
      layout?: TabBarLayout;
      minimized?: boolean;
      defaultMinimized?: boolean;
      onMinimizedChange?: (minimized: boolean) => void;
      autoMinimize?: boolean | "up" | "down";
      scrollTarget?: HTMLElement | (() => HTMLElement | null | undefined);
      expandLabel?: string;
    };
</script>

<script lang="ts">
  import { bindTabBarScroll } from "@lenso/glass/motion";
  import { tabBarStyles as s } from "@lenso/tokens/tab-bar";
  import { untrack } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import { setTabBar, type TabBarLayout } from "./context.js";

  let {
    elastic = true,
    layout = "phone",
    minimized,
    defaultMinimized,
    onMinimizedChange,
    autoMinimize,
    scrollTarget,
    expandLabel = "Expand navigation",
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: TabBarRootProps = $props();

  let element: HTMLElement | undefined = $state();
  let localMinimized = $state(untrack(() => defaultMinimized ?? false));
  const collapsed = $derived(minimized ?? localMinimized);
  const target = $derived(typeof scrollTarget === "function" ? scrollTarget() : scrollTarget);
  const presentation = $derived(
    styled(
      [s.root, layout === "phone" && s.phoneRoot, layout === "vertical" && s.verticalRoot],
      xstyle,
      className,
      style,
    ),
  );

  function changeMinimized(next: boolean) {
    if (next === collapsed) return;
    if (minimized === undefined) localMinimized = next;
    onMinimizedChange?.(next);
  }

  setTabBar({
    layout: () => layout,
    elastic: () => elastic,
    minimized: () => collapsed,
    expandLabel: () => expandLabel,
    changeMinimized,
  });
  $effect(() => {
    if (element && autoMinimize && (scrollTarget === undefined || target)) {
      return bindTabBarScroll(
        element,
        target ?? undefined,
        autoMinimize === "up" ? "up" : "down",
        collapsed,
        changeMinimized,
      );
    }
  });
</script>

<nav
  data-lenso-slot="tab-bar"
  {...rest}
  {...presentation}
  bind:this={element}
  data-minimized={collapsed ? "" : undefined}
  data-layout={layout}
>
  {@render children?.()}
</nav>
