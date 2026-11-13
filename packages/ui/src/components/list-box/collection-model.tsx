"use client";
import * as React from "react";
import { useCollectionDrag, type CollectionDragAndDrop } from "./drag-and-drop.js";

export type CollectionKey = React.Key;
export interface CollectionItem {
  key: CollectionKey;
  textValue: string;
  disabled?: boolean;
}
export interface SelectionProps {
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: ReadonlySet<CollectionKey>;
  defaultSelectedKeys?: ReadonlySet<CollectionKey>;
  disabledKeys?: ReadonlySet<CollectionKey>;
  onSelectionChange?: (keys: Set<CollectionKey>) => void;
}
export interface CollectionDragProps {
  dragAndDrop?: CollectionDragAndDrop;
}
interface Entry {
  key: CollectionKey;
  node: HTMLElement;
  textValue: string;
  disabled: boolean;
}
export interface CollectionModel {
  selected: ReadonlySet<CollectionKey>;
  active: CollectionKey | null;
  mode: NonNullable<SelectionProps["selectionMode"]>;
  disabledKeys?: ReadonlySet<CollectionKey>;
  register: (entry: Entry) => () => void;
  getNode: (key: CollectionKey) => HTMLElement | undefined;
  keyForNode: (node: HTMLElement) => CollectionKey | undefined;
  setCollectionItems: (items: readonly CollectionItem[] | undefined) => void;
  collectionSize?: number;
  itemPosition: (key: CollectionKey) => number | undefined;
  focus: (key: CollectionKey) => void;
  select: (key: CollectionKey, extend?: boolean) => void;
  extendSelection: (from: CollectionKey, to: CollectionKey) => void;
  selectAll: () => void;
  clearSelection: () => void;
  enabledKeys: () => CollectionKey[];
  deselect: (key: CollectionKey) => void;
  keyDown: (event: React.KeyboardEvent<HTMLElement>, key?: CollectionKey) => void;
  remove?: (key: CollectionKey) => void;
  onAction?: (key: CollectionKey) => void;
  drag: ReturnType<typeof useCollectionDrag>;
}
export const CollectionContext = React.createContext<CollectionModel | null>(null);

export function useCollectionModel(
  props: SelectionProps &
    CollectionDragProps & { selectionFollowsFocus?: boolean; loopFocus?: boolean },
  providedItems?: readonly CollectionItem[],
  focusVirtual?: (key: CollectionKey) => void,
): CollectionModel {
  const {
    selectedKeys,
    defaultSelectedKeys,
    disabledKeys,
    selectionMode = "none",
    onSelectionChange,
    selectionFollowsFocus = false,
    loopFocus = true,
  } = props;
  const [internal, setInternal] = React.useState(() => new Set(defaultSelectedKeys));
  const [active, setActive] = React.useState<CollectionKey | null>(null);
  const [ownedItems, setCollectionItems] = React.useState<readonly CollectionItem[]>();
  const collectionItems = providedItems ?? ownedItems;
  const entries = React.useRef(new Map<CollectionKey, Entry>());
  const search = React.useRef({ value: "", time: 0 });
  const anchor = React.useRef<CollectionKey | null>(null);
  const movingFocus = React.useRef(false);
  const range = React.useRef<ReadonlySet<CollectionKey>>(new Set());
  const enabledKeys = () =>
    [...(collectionItems ?? entries.current.values())]
      .filter((entry) => !entry.disabled && !disabledKeys?.has(entry.key))
      .sort((a, b) =>
        collectionItems
          ? 0
          : (a as Entry).node.compareDocumentPosition((b as Entry).node) &
              Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
      )
      .map((entry) => entry.key);
  const drag = useCollectionDrag(
    props.dragAndDrop,
    selectedKeys ?? internal,
    enabledKeys,
    (key) => {
      setActive(key);
      const node = entries.current.get(key)?.node;
      (node?.querySelector<HTMLElement>("td") ?? node)?.focus();
    },
  );
  const register = React.useCallback((entry: Entry) => {
    if (entries.current.has(entry.key))
      throw new Error(`Duplicate collection key: ${String(entry.key)}`);
    entries.current.set(entry.key, entry);
    const first = () =>
      [...entries.current.values()]
        .filter((item) => !item.disabled)
        .sort((a, b) =>
          a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
        )[0]?.key ?? null;
    setActive((current) => current ?? first());
    return () => {
      entries.current.delete(entry.key);
      setActive((current) => (current === entry.key ? first() : current));
    };
  }, []);
  return React.useMemo<CollectionModel>(() => {
    const selected = selectedKeys ?? internal;
    const activeKey =
      selectionFollowsFocus && selectionMode === "single"
        ? (selected.values().next().value ?? active)
        : active;
    const ordered = () =>
      collectionItems ??
      [...entries.current.values()].sort((a, b) =>
        a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
    const enabled = () =>
      ordered().filter((entry) => !entry.disabled && !disabledKeys?.has(entry.key));
    const focus = (key: CollectionKey) => {
      // Native focus synchronously re-enters through the option's onFocus.
      if (movingFocus.current) return;
      movingFocus.current = true;
      try {
        setActive(key);
        if (selectionFollowsFocus && selectionMode === "single" && !selected.has(key))
          commit(new Set([key]));
        const node = entries.current.get(key)?.node;
        if (node) node.focus();
        else focusVirtual?.(key);
      } finally {
        movingFocus.current = false;
      }
    };
    const commit = (next: Set<CollectionKey>) => {
      if (selectedKeys === undefined) setInternal(next);
      onSelectionChange?.(next);
    };
    const selectAll = () => {
      if (selectionMode === "multiple") commit(new Set(enabled().map((entry) => entry.key)));
    };
    const select = (key: CollectionKey, extend = false) => {
      if (
        selectionMode === "none" ||
        disabledKeys?.has(key) ||
        entries.current.get(key)?.disabled ||
        collectionItems?.find((item) => item.key === key)?.disabled
      )
        return;
      const next = selectionMode === "single" ? new Set<CollectionKey>([key]) : new Set(selected);
      if (selectionMode === "multiple") {
        if (extend && anchor.current !== null) {
          const items = enabled();
          const start = items.findIndex((entry) => entry.key === anchor.current);
          const end = items.findIndex((entry) => entry.key === key);
          if (start !== -1 && end !== -1) {
            for (const previous of range.current) next.delete(previous);
            range.current = new Set(
              items.slice(Math.min(start, end), Math.max(start, end) + 1).map((entry) => entry.key),
            );
            for (const entry of range.current) next.add(entry);
          }
        } else {
          anchor.current = key;
          range.current = new Set([key]);
          if (next.has(key)) next.delete(key);
          else next.add(key);
        }
      }
      commit(next);
    };
    return {
      selected,
      active: activeKey,
      mode: selectionMode,
      disabledKeys,
      drag,
      focus,
      select,
      extendSelection(from, to) {
        anchor.current ??= from;
        select(to, true);
      },
      selectAll,
      clearSelection: () => commit(new Set()),
      enabledKeys: () => enabled().map((entry) => entry.key),
      getNode: (key) => entries.current.get(key)?.node,
      collectionSize: collectionItems?.length,
      itemPosition: (key) => {
        const index = collectionItems?.findIndex((item) => item.key === key);
        return index !== undefined && index >= 0 ? index + 1 : undefined;
      },
      keyForNode: (node) => [...entries.current.values()].find((entry) => entry.node === node)?.key,
      setCollectionItems,
      deselect(key) {
        if (!selected.has(key)) return;
        const next = new Set(selected);
        next.delete(key);
        if (selectedKeys === undefined) setInternal(next);
        onSelectionChange?.(next);
      },
      register,
      keyDown(event, key = activeKey ?? undefined) {
        if (key !== undefined && drag.keyDown(event, key)) return;
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
          if (selectionMode === "multiple") {
            event.preventDefault();
            selectAll();
          }
          return;
        }
        if (event.altKey || event.metaKey || event.ctrlKey) return;
        const items = enabled();
        const index = items.findIndex((entry) => entry.key === key);
        let target: CollectionItem | undefined;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        if (event.key === "Home") target = items[0];
        else if (event.key === "End") target = items.at(-1);
        else if (event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight"))
          target =
            items[loopFocus ? (index + 1) % items.length : Math.min(index + 1, items.length - 1)];
        else if (event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft"))
          target =
            items[loopFocus ? (index - 1 + items.length) % items.length : Math.max(index - 1, 0)];
        else if ((event.key === " " || event.key === "Enter") && key !== undefined) {
          event.preventDefault();
          select(key);
          return;
        } else if (event.key.length === 1 && event.key !== " ") {
          event.preventDefault();
          const now = Date.now();
          search.current.value =
            (now - search.current.time > 500 ? "" : search.current.value) +
            event.key.toLocaleLowerCase();
          search.current.time = now;
          const query = [...search.current.value].every((char) => char === search.current.value[0])
            ? event.key.toLocaleLowerCase()
            : search.current.value;
          target = [...items.slice(index + 1), ...items.slice(0, index + 1)].find((entry) =>
            entry.textValue.toLocaleLowerCase().startsWith(query),
          );
        }
        if (target) {
          event.preventDefault();
          if (event.shiftKey) {
            anchor.current ??= key ?? target.key;
            select(target.key, true);
          }
          focus(target.key);
        }
      },
    };
  }, [
    active,
    internal,
    selectedKeys,
    disabledKeys,
    selectionMode,
    selectionFollowsFocus,
    loopFocus,
    onSelectionChange,
    register,
    drag,
    collectionItems,
    focusVirtual,
  ]);
}
