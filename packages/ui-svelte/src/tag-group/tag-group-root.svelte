<script module lang="ts">
  export type TagGroupRootProps = SvelteHTMLElements["div"] &
    StyleXProps & {
      items?: readonly TagGroupItem[];
      defaultItems?: readonly TagGroupItem[];
      onItemsChange?: (items: TagGroupItem[]) => void;
      onRemove?: (keys: Set<TableKey>) => void;
      selectionMode?: TagGroupMode;
      selectedKeys?: ReadonlySet<TableKey>;
      defaultSelectedKeys?: ReadonlySet<TableKey>;
      disabledKeys?: ReadonlySet<TableKey>;
      onSelectionChange?: (keys: Set<TableKey>, details?: ChangeDetails<ModelChangeReason>) => void;
      controller?: TagGroupController;
      disabled?: boolean;
      size?: TagGroupSize;
      variant?: TagGroupVariant;
    };
</script>

<script lang="ts">
  import { tagGroup, type ModelChangeReason } from "@lenso/primitives/model-control";
  import type { TableKey } from "@lenso/primitives/table/core";
  import { tagGroupStyles } from "@lenso/tokens/tag-group";
  import { createTypeahead, isTypeaheadKey, type ChangeDetails } from "@ui-sdk/core";
  import { Part, usePart, usePrimitive, type PrimitiveHandle } from "@ui-sdk/svelte/primitive";
  import { createAttachmentKey } from "svelte/attachments";
  import { tick, untrack } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import {
    setTagGroup,
    tagId,
    type TagGroupController,
    type TagGroupItem,
    type TagGroupMode,
    type TagGroupSize,
    type TagGroupVariant,
  } from "./context.js";

  let {
    items,
    defaultItems,
    onItemsChange,
    onRemove,
    selectionMode = "none",
    selectedKeys,
    defaultSelectedKeys,
    disabledKeys,
    onSelectionChange,
    controller,
    disabled = false,
    size = "md",
    variant = "default",
    xstyle,
    class: className,
    style,
    children,
    onkeydown,
    ...rest
  }: TagGroupRootProps = $props();

  let root: HTMLElement | undefined = $state();
  let owned = $state.raw(untrack(() => defaultItems));
  let localSelection = $state.raw(untrack(() => new Set(defaultSelectedKeys)));
  let removed = $state.raw(new Set<TableKey>());
  const collection = $derived(items ?? owned);
  const selected = $derived(selectedKeys ?? localSelection);
  const removable = $derived(Boolean(collection || onRemove || onItemsChange));
  const nodes = new Map<string, { key: TableKey; node: HTMLElement }>();
  const id = $props.id();
  let anchor: string | undefined;
  const search = createTypeahead();
  const isDisabled = (key: TableKey) => disabled || Boolean(disabledKeys?.has(key));

  function fromIds(value: string[]) {
    return new Set(
      value.flatMap((id) => {
        const item = nodes.get(id);
        return item ? [item.key] : [];
      }),
    );
  }

  const handle: PrimitiveHandle<typeof tagGroup> = usePrimitive(tagGroup, () => ({
    id,
    disabled,
    controller,
    value: [...selected].map(tagId),
    validate(value) {
      return (
        !disabled &&
        selectionMode !== "none" &&
        Array.isArray(value) &&
        (selectionMode === "multiple" || value.length <= 1) &&
        value.every((id) => handle.api.roving.items().some((item) => item.key === id))
      );
    },
    onValueChange(value, details) {
      if (!Array.isArray(value)) return details.cancel();
      const next = fromIds(value);
      onSelectionChange?.(next, details);
      if (!details.canceled && selectedKeys === undefined) localSelection = next;
    },
    move(event, from) {
      const available = handle.api.roving.items();
      const index = available.findIndex(({ key }) => key === from);
      if (isTypeaheadKey(event)) {
        return available[
          search(
            event.key,
            available.map((item) => item.el.getAttribute("aria-label") ?? ""),
            index,
          )
        ]?.key;
      }
      const rtl = root && getComputedStyle(root).direction === "rtl";
      const step =
        event.key === "ArrowRight"
          ? rtl
            ? -1
            : 1
          : event.key === "ArrowLeft"
            ? rtl
              ? 1
              : -1
            : event.key === "ArrowDown"
              ? 1
              : event.key === "ArrowUp"
                ? -1
                : 0;
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? available.length - 1
            : step
              ? (index + step + available.length) % available.length
              : -1;
      return available[next]?.key;
    },
  }));
  const part = usePart(handle, "root");
  let current = $state.raw(handle.instance.get());
  $effect(() => {
    const update = () => {
      current = handle.instance.get();
    };
    update();
    return handle.instance.subscribe(update);
  });
  const presentation = $derived(styled(tagGroupStyles.root, xstyle, className, style));

  function select(key: TableKey, event: Event, initial?: string) {
    if (selectionMode === "none" || isDisabled(key)) return;
    const id = tagId(key);
    const next = new Set([...selected].map(tagId));
    if (selectionMode === "single") {
      next.clear();
      next.add(id);
    } else {
      const shift = ("shiftKey" in event && event.shiftKey) === true;
      const items = handle.api.roving.items().map((item) => item.key);
      const from = items.indexOf(anchor ?? initial ?? id);
      const to = items.indexOf(id);
      if (shift && from !== -1 && to !== -1) {
        anchor ??= items[from];
        for (const entry of items.slice(Math.min(from, to), Math.max(from, to) + 1))
          next.add(entry);
      } else {
        anchor = id;
        if (next.has(id)) next.delete(id);
        else next.add(id);
      }
    }
    handle.api.setValue([...next], { reason: "item-press", event });
  }

  function remove(key: TableKey) {
    if (!removable || isDisabled(key)) return;
    const item = nodes.get(tagId(key));
    if (!item) return;
    const ordered = handle.api.roving.items();
    const index = ordered.findIndex((row) => row.el === item.node);
    if (index === -1) return;
    const neighbors = [...ordered.slice(index + 1), ...ordered.slice(0, index).reverse()];
    if (collection) {
      const next = collection.filter((entry) => entry.key !== key);
      if (items === undefined) owned = next;
      onItemsChange?.(next);
    } else if (!onRemove) removed = new Set([...removed, key]);
    onRemove?.(new Set([key]));

    const settle = () => {
      if (item.node.isConnected) return false;
      if (selected.has(key)) {
        const next = new Set(selected);
        next.delete(key);
        if (selectedKeys === undefined) localSelection = next;
        onSelectionChange?.(next);
      }
      const target = neighbors.find(({ el }) => el.isConnected)?.el ?? root;
      const active = item.node.ownerDocument.activeElement;
      if (active === item.node.ownerDocument.body || root?.contains(active)) target?.focus();
      return true;
    };
    void tick().then(() => {
      if (settle() || !root) return;
      pending.set(item.node, settle);
    });
  }

  const pending = new Map<HTMLElement, () => boolean>();
  $effect(() => {
    if (!root) return;
    const observer = new MutationObserver(() => {
      for (const [node, complete] of pending) if (complete()) pending.delete(node);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      pending.clear();
    };
  });

  setTagGroup({
    handle,
    state: () => current,
    items: () => collection,
    removable: () => removable,
    mode: () => selectionMode,
    size: () => size,
    variant: () => variant,
    disabled: () => disabled,
    isDisabled,
    isSelected: (key) => selected.has(key),
    isRemoved: (key) => removed.has(key),
    register(key, node, inactive) {
      const id = tagId(key);
      nodes.set(id, { key, node });
      const unbind = handle.api.bind(node, id, inactive);
      return () => {
        unbind();
        if (nodes.get(id)?.node === node) nodes.delete(id);
      };
    },
    select,
    remove,
    extend(id, event, from) {
      const key = nodes.get(id)?.key;
      if (key !== undefined) select(key, event, from);
    },
  });
  const rootRef = {
    [createAttachmentKey()](node: HTMLElement) {
      root = node;
      return () => {
        root = undefined;
      };
    },
  };
</script>

{#if part.present}
  <Part
    tag="div"
    {part}
    props={{
      ...rootRef,
      ...rest,
      ...presentation,
      children: content,
      role: "grid",
      "data-lenso-slot": rest["data-lenso-slot"] ?? "tag-group",
      "aria-multiselectable": selectionMode === "multiple" || undefined,
      "aria-disabled": disabled || undefined,
      tabindex: disabled || current.focused !== null ? -1 : 0,
      onkeydown,
    }}
  />
{/if}

{#snippet content()}
  {@render children?.()}
{/snippet}
