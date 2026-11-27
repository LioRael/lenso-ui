<script module lang="ts">
  export type TabBarGroupProps = SvelteHTMLElements["div"] & StyleXProps & { separate?: boolean };
</script>

<script lang="ts">
  import { attachGlass } from "@lenso/glass";
  import {
    bindTabBarPress,
    bindTabBarMinimize,
    bindTabBarMotion,
    restoreTabBarFocus,
  } from "@lenso/glass/motion";
  import { glassStyles } from "@lenso/tokens/glass";
  import { knobMaterialStyles as knob, materialStyles } from "@lenso/tokens/materials";
  import { tabsStyles } from "@lenso/tokens/tabs";
  import { tabBarStyles as s } from "@lenso/tokens/tab-bar";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { createAttachmentKey } from "svelte/attachments";
  import MaterialBackground from "../glass/material-background.svelte";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import Action from "./action.svelte";
  import { getTabBar, setSeparate } from "./context.js";

  let { separate, xstyle, class: className, style, children, ...rest }: TabBarGroupProps = $props();
  const bar = getTabBar();
  setSeparate(() => Boolean(separate));
  const layout = $derived(bar?.layout() ?? "phone");
  const collapsed = $derived(Boolean(bar?.minimized() && !separate));
  const listId = $props.id();
  let binding = $state.raw<ReturnType<typeof bindTabBarMinimize>>();
  let group: HTMLDivElement | undefined = $state();
  const elastic = $derived(bar?.elastic() ?? true);
  $effect(() => {
    if (!group) return;
    const minimize = bindTabBarMinimize(group, Boolean(separate), layout);
    binding = minimize;
    const stopMotion = separate ? undefined : bindTabBarMotion(group, layout === "vertical");
    return () => {
      stopMotion?.();
      minimize?.destroy();
    };
  });
  $effect(() => {
    binding?.setMinimized(collapsed);
  });
  $effect(() => {
    if (!group || !elastic) return;
    return bindTabBarPress(group);
  });

  let list: HTMLUListElement | undefined = $state();
  let expand: HTMLButtonElement | undefined = $state();
  let restoreFocus = false;
  let listHadFocus = false;
  const expandRef = {
    [createAttachmentKey()](node: HTMLButtonElement) {
      expand = node;
      return () => {
        expand = undefined;
      };
    },
  };
  const presentation = $derived(
    styled(
      [
        s.group,
        layout === "phone" ? s.phoneGroup : layout === "vertical" ? s.verticalGroup : s.tabletGroup,
        separate && s.separate,
        separate &&
          layout !== "vertical" &&
          (layout === "phone" ? s.phoneSeparate : s.tabletSeparate),
        elastic && s.elastic,
      ],
      xstyle,
      className,
      style,
    ),
  );

  $effect(() => {
    if (collapsed) {
      if (expand && (listHadFocus || list?.contains(list.ownerDocument.activeElement))) {
        expand.focus({ preventScroll: true });
        listHadFocus = false;
      }
    } else if (restoreFocus) {
      restoreFocus = false;
      if (list) return restoreTabBarFocus(list);
    }
  });
</script>

<div
  data-lenso-slot="tab-bar-group"
  {...rest}
  {...presentation}
  bind:this={group}
  data-tab-bar-group=""
  data-minimized={collapsed ? "" : undefined}
  data-layout={layout}
  data-separate={separate ? "" : undefined}
>
  <div
    aria-hidden="true"
    data-material="glass-small"
    data-material-resting=""
    {...attributes(
      materialStyles.root,
      materialStyles.accessible,
      s.material,
      layout !== "phone" && s.tabletMaterial,
    )}
  >
    <MaterialBackground liveGeometry />
  </div>
  {#if !separate}
    <span
      data-lenso-slot="tab-bar-indicator"
      aria-hidden="true"
      inert
      {...attributes(glassStyles.hotspot, s.indicator)}
    >
      <span
        data-lenso-slot="tab-bar-refraction"
        {...attributes(tabsStyles.refraction, s.indicatorRefraction)}
      >
        <span
          aria-hidden="true"
          data-knob-material="toggle"
          {...attributes(knob.layer, knob.toggle, knob.controlEdge)}
          {@attach (node) => attachGlass(node, { liveGeometry: true })}
        ></span>
        <span aria-hidden="true" {...attributes(knob.face)}></span>
      </span>
    </span>
    <span data-lenso-slot="tab-bar-highlight" aria-hidden="true" inert {...attributes(s.highlight)}>
      <span data-lenso-slot="tab-bar-highlight-ring" {...attributes(s.highlightClip)}>
        <span data-lenso-slot="tab-bar-highlight-optics" {...attributes(s.highlightOptics)}>
          <span data-lenso-slot="tab-bar-highlight-row" {...attributes(s.highlightRow)}></span>
        </span>
      </span>
      <span data-lenso-slot="tab-bar-highlight-centre" {...attributes(s.highlightClip)}>
        <span data-lenso-slot="tab-bar-highlight-centre-row" {...attributes(s.highlightRow)}></span>
      </span>
    </span>
  {/if}
  <ul
    id={listId}
    bind:this={list}
    data-tab-bar-list=""
    data-lenso-slot="tab-bar-list"
    aria-hidden={collapsed || undefined}
    inert={collapsed}
    onfocusin={() => {
      listHadFocus = true;
    }}
    onfocusout={(event) => {
      if (event.relatedTarget instanceof Node && !list?.contains(event.relatedTarget))
        listHadFocus = false;
    }}
    {...attributes(
      s.list,
      layout === "vertical" && s.verticalList,
      layout === "tablet" && s.tabletList,
      layout === "tablet" && separate && s.tabletSeparateList,
    )}
  >
    {@render children?.()}
  </ul>
  {#if collapsed}
    <Action
      {...expandRef}
      data-tab-bar-expand=""
      aria-label={bar?.expandLabel() ?? "Expand navigation"}
      aria-expanded="false"
      aria-controls={listId}
      xstyle={s.expand}
      onfocus={() => {
        restoreFocus = true;
      }}
      onblur={(event) => {
        if (event.relatedTarget && event.relatedTarget !== event.currentTarget?.ownerDocument.body)
          restoreFocus = false;
      }}
      onclick={() => {
        restoreFocus = true;
        bar?.changeMinimized(false);
      }}
    >
      <span aria-hidden="true" {...attributes(s.expandFallback)}>⋯</span>
    </Action>
  {/if}
</div>
