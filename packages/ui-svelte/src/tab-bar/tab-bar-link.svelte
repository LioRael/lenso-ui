<script module lang="ts">
  export type TabBarLinkProps = ComponentProps<typeof Link> & {
    icon?: Snippet;
    iconOnly?: boolean;
    isCurrent?: boolean;
    disabled?: boolean;
  };
</script>

<script lang="ts">
  import { tabBarStyles as s } from "@lenso/tokens/tab-bar";
  import type { ComponentProps, Snippet } from "svelte";
  import { attributes } from "../styled.js";
  import { getSeparate, getTabBar } from "./context.js";
  import Item from "./item.svelte";
  import Label from "./label.svelte";
  import Link from "./link.svelte";

  let { icon, iconOnly, isCurrent, disabled, href, children, xstyle, ...rest }: TabBarLinkProps =
    $props();
  const bar = getTabBar();
  const separate = getSeparate();
  const layout = $derived(bar?.layout() ?? "phone");
  const ariaCurrent = $derived(rest["aria-current"]);
  const current = $derived(
    ariaCurrent == null ? Boolean(isCurrent) : ariaCurrent !== false && ariaCurrent !== "false",
  );
  const hideLabel = $derived(iconOnly ?? (layout === "vertical" || Boolean(separate?.())));
</script>

<Item
  xstyle={[layout === "tablet" && s.tabletItemContainer, separate?.() && s.separateItemContainer]}
>
  <Link
    {...rest}
    href={disabled ? undefined : href}
    role={rest.role ?? (disabled ? "link" : undefined)}
    aria-current={ariaCurrent ?? (current ? "page" : undefined)}
    aria-disabled={disabled || rest["aria-disabled"]}
    tabindex={disabled ? -1 : rest.tabindex}
    data-tab-bar-item=""
    data-tab-bar-destination=""
    data-tab-bar-has-icon={icon ? "" : undefined}
    data-current={current ? "" : undefined}
    xstyle={[
      layout === "tablet" && s.tabletItem,
      layout === "vertical" && s.verticalItem,
      hideLabel && s.iconOnlyItem,
      current && s.current,
      xstyle,
    ]}
  >
    {#if current}
      <span
        aria-hidden="true"
        data-tab-bar-fallback=""
        {...attributes(
          s.fallback,
          layout === "tablet" && s.tabletFallback,
          layout === "vertical" && s.verticalFallback,
        )}
      ></span>
    {/if}
    <Label {icon} iconOnly={hideLabel} {children} />
  </Link>
</Item>
