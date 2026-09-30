"use client";
// Anatomy adapted from HeroUI v3.2.6 (Apache-2.0), e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { listBoxStyles } from "@lenso/tokens/list-box";
import { type StyleXProps } from "../../utils/styled.js";
import { useCollectionWindow, type WindowOptions } from "./windowed.js";
import { CollectionElement, type CollectionRender } from "./element.js";
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
  props: SelectionProps & CollectionDragProps,
  providedItems?: readonly CollectionItem[],
  focusVirtual?: (key: CollectionKey) => void,
): CollectionModel {
  const {
    selectedKeys,
    defaultSelectedKeys,
    disabledKeys,
    selectionMode = "none",
    onSelectionChange,
  } = props;
  const [internal, setInternal] = React.useState(() => new Set(defaultSelectedKeys));
  const [active, setActive] = React.useState<CollectionKey | null>(null);
  const [ownedItems, setCollectionItems] = React.useState<readonly CollectionItem[]>();
  const collectionItems = providedItems ?? ownedItems;
  const entries = React.useRef(new Map<CollectionKey, Entry>());
  const search = React.useRef({ value: "", time: 0 });
  const anchor = React.useRef<CollectionKey | null>(null);
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
    const ordered = () =>
      collectionItems ??
      [...entries.current.values()].sort((a, b) =>
        a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
    const enabled = () =>
      ordered().filter((entry) => !entry.disabled && !disabledKeys?.has(entry.key));
    const focus = (key: CollectionKey) => {
      setActive(key);
      const node = entries.current.get(key)?.node;
      if (node) node.focus();
      else focusVirtual?.(key);
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
      active,
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
      keyDown(event, key = active ?? undefined) {
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
          target = items[(index + 1) % items.length];
        else if (event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft"))
          target = items[(index - 1 + items.length) % items.length];
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
    onSelectionChange,
    register,
    drag,
    collectionItems,
    focusVirtual,
  ]);
}

export interface ListBoxRootProps
  extends
    StyleXProps<Omit<React.ComponentPropsWithRef<"div">, "children">>,
    SelectionProps,
    CollectionDragProps {
  items?: readonly CollectionItem[];
  children?: React.ReactNode | ((item: CollectionItem) => React.ReactNode);
  virtualized?: WindowOptions;
  render?: CollectionRender;
  onAction?: (key: CollectionKey) => void;
}
export function ListBoxRoot({
  items,
  children,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  disabledKeys,
  onSelectionChange,
  xstyle,
  style,
  onKeyDown,
  onScroll,
  virtualized,
  ref,
  render,
  onAction,
  dragAndDrop,
  ...props
}: ListBoxRootProps) {
  const node = React.useRef<HTMLDivElement>(null);
  const window = useCollectionWindow(items?.length ?? 0, virtualized, node);
  const scrollTo = window.scrollTo;
  const focusVirtual = React.useCallback(
    (key: CollectionKey) => {
      const index = items?.findIndex((item) => item.key === key) ?? -1;
      if (index >= 0) scrollTo(index);
    },
    [items, scrollTo],
  );
  const model = useCollectionModel(
    {
      selectionMode,
      selectedKeys,
      defaultSelectedKeys,
      disabledKeys,
      onSelectionChange,
      dragAndDrop,
    },
    items,
    virtualized ? focusVirtual : undefined,
  );
  const compiled = stylex.props(listBoxStyles.root, xstyle);
  const collectionValue = React.useMemo(() => ({ ...model, onAction }), [model, onAction]);
  // oxlint-disable jsx-a11y/prefer-tag-over-role -- This rich listbox has custom option children and roving DOM focus; select/datalist cannot represent that contract.
  return (
    <CollectionContext.Provider value={collectionValue}>
      <CollectionElement
        render={render}
        {...props}
        {...compiled}
        ref={(value) => {
          node.current = value;
          if (typeof ref === "function") return ref(value);
          if (ref) ref.current = value;
        }}
        style={{
          ...compiled.style,
          ...style,
          ...(virtualized && { height: virtualized.height, overflowY: "auto" }),
        }}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "list-box"}
        role="listbox"
        aria-multiselectable={selectionMode === "multiple" || undefined}
        tabIndex={model.active === null ? 0 : -1}
        onScroll={(event) => {
          onScroll?.(event);
          window.onScroll();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) model.keyDown(event);
        }}
      >
        {dragAndDrop && (
          <span
            aria-live="polite"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clipPath: "inset(50%)",
            }}
          >
            {model.drag.announcement}
          </span>
        )}
        {typeof children === "function" ? (
          virtualized && items ? (
            <div style={{ height: items.length * virtualized.rowHeight, position: "relative" }}>
              {window.indices.map((index) => {
                const item = items[index]!;
                return (
                  <div
                    key={`${typeof item.key}:${String(item.key)}`}
                    data-window-index={index}
                    style={{
                      position: "absolute",
                      top: index * virtualized.rowHeight,
                      width: "100%",
                      height: virtualized.rowHeight,
                    }}
                    onFocus={() => window.setFocused(index)}
                  >
                    {children(item)}
                  </div>
                );
              })}
            </div>
          ) : (
            items?.map((item) => (
              <React.Fragment key={`${typeof item.key}:${String(item.key)}`}>
                {children(item)}
              </React.Fragment>
            ))
          )
        ) : (
          children
        )}
      </CollectionElement>
    </CollectionContext.Provider>
  );
  // oxlint-enable jsx-a11y/prefer-tag-over-role
}
export const ListBox = Object.assign(ListBoxRoot, { Root: ListBoxRoot });
