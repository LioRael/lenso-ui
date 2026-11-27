<script module lang="ts">
  export type ListItemProps = Omit<SvelteHTMLElements["li"], "children"> &
    StyleXProps & {
      itemKey?: ListKey;
      textValue?: string;
      height?: "regular" | "tall";
      disabled?: boolean;
      selectionLabel?: string;
      reorderLabel?: string;
      startActions?: readonly SwipeAction[];
      endActions?: readonly SwipeAction[];
      children?: Snippet<[{ editing: boolean; isSelected: boolean }]>;
    };
</script>

<script lang="ts">
  import { listKey, type ListKey } from "@lenso/primitives/list/core";
  import { listStyles as s } from "@lenso/tokens/list";
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { Checkbox } from "../checkbox/index.js";
  import { styled, type StyleXProps } from "../styled.js";
  import { SwipeActions, type SwipeAction } from "../swipe-actions/index.js";
  import { getList, getSection } from "./context.js";
  import Reorder from "./reorder.svelte";
  import Row from "./row.svelte";
  import Selection from "./selection.svelte";

  let {
    itemKey,
    textValue,
    height,
    disabled,
    selectionLabel,
    reorderLabel,
    startActions,
    endActions,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: ListItemProps = $props();

  const model = getList();
  const section = getSection();
  let node: HTMLLIElement | undefined = $state();
  const inactive = $derived(Boolean(disabled || model?.state().disabled));
  const editing = $derived(itemKey !== undefined && Boolean(model?.state().editing));
  const key = $derived(itemKey === undefined ? undefined : listKey(itemKey));
  const selected = $derived(key !== undefined && Boolean(model?.state().value.includes(key)));
  const draft = $derived(model?.state().reordering);
  const label = $derived(textValue ?? String(itemKey ?? "item"));
  const dropPosition = $derived.by(() => {
    if (!draft || !model || key === undefined) return;
    const from = model.state().order.indexOf(draft.key);
    const to = draft.order.indexOf(draft.key);
    if (from === to || from < 0 || to < 0) return;
    if (draft.order[to + (to < from ? 1 : -1)] === key) return to < from ? "before" : "after";
  });
  const presentation = $derived(
    styled(
      [
        s.container,
        s.boundary,
        key !== undefined && draft?.key === key && s.dragged,
        dropPosition === "before" && s.dropBefore,
        dropPosition === "after" && s.dropAfter,
      ],
      xstyle,
      className,
      style,
    ),
  );

  $effect(() => {
    if (model && node && itemKey !== undefined) {
      return model.handle.api.register({
        key: itemKey,
        text: label,
        node,
        disabled: Boolean(disabled),
        group: section?.(),
      });
    }
  });
</script>

{#snippet row()}
  <Row xstyle={height === "tall" && s.tall}>
    {#if editing && itemKey !== undefined}
      <Selection data-list-selection="">
        <Checkbox
          aria-label={selectionLabel ?? `Select ${label}`}
          checked={selected}
          disabled={inactive}
          onCheckedChange={(checked, details) => {
            if (itemKey !== undefined)
              model?.handle.api.setChecked(itemKey, checked === true, { event: details.event });
          }}
        >
          <Checkbox.Control xstyle={s.selectionControl}><Checkbox.Indicator /></Checkbox.Control>
        </Checkbox>
      </Selection>
    {/if}
    {@render children?.({ editing, isSelected: selected })}
    {#if editing && itemKey !== undefined}
      <Reorder
        aria-label={reorderLabel ?? `Reorder ${label}`}
        disabled={inactive}
        data-list-reorder=""
        onpointerdown={(event) => {
          if (itemKey !== undefined) model?.handle.api.pointerdown(event, itemKey);
        }}
        onkeydown={(event) => {
          if (itemKey !== undefined) model?.handle.api.keydown(event, itemKey);
        }}
        onclick={(event) => {
          if (!event.defaultPrevented && itemKey !== undefined) model?.handle.api.activate(itemKey);
        }}
      >
        <span aria-hidden="true">≡</span>
      </Reorder>
    {/if}
  </Row>
{/snippet}

<li data-lenso-slot="list-item" {...rest} {...presentation} bind:this={node}>
  {#if !editing && (startActions?.length || endActions?.length)}
    <SwipeActions {startActions} {endActions} disabled={inactive}>
      {@render row()}
    </SwipeActions>
  {:else}
    {@render row()}
  {/if}
</li>
