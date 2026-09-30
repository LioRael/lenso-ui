"use client";
// HeroUI v3.2.6 anatomy/styles adaptation, Apache-2.0.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { tagGroupStyles } from "@lenso/tokens/tag-group";
import { type StyleXProps } from "../../utils/styled.js";
import { CollectionElement, type CollectionRender } from "../list-box/element.js";
import {
  CollectionContext,
  useCollectionModel,
  type CollectionItem,
  type CollectionKey,
  type SelectionProps,
} from "../list-box/list-box.js";

export interface TagGroupRootProps
  extends StyleXProps<React.ComponentPropsWithRef<"div">>, SelectionProps {
  items?: readonly CollectionItem[];
  defaultItems?: readonly CollectionItem[];
  onItemsChange?: (items: CollectionItem[]) => void;
  onRemove?: (keys: Set<CollectionKey>) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "surface";
  render?: CollectionRender;
}
export const TagGroupContext = React.createContext<{
  items?: readonly CollectionItem[];
  removed: ReadonlySet<CollectionKey>;
  size: "sm" | "md" | "lg";
  variant: "default" | "surface";
  disabled: boolean;
  removable: boolean;
}>({ removed: new Set(), size: "md", variant: "default", disabled: false, removable: false });

export function TagGroupRoot({
  items,
  defaultItems,
  onItemsChange,
  onRemove,
  size = "md",
  variant = "default",
  disabled = false,
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  disabledKeys,
  onSelectionChange,
  xstyle,
  style,
  onKeyDown,
  children,
  ref,
  render,
  ...props
}: TagGroupRootProps) {
  const [internal, setInternal] = React.useState(defaultItems);
  const [removed, setRemoved] = React.useState<ReadonlySet<CollectionKey>>(new Set());
  const collection = items ?? internal;
  const root = React.useRef<HTMLDivElement>(null);
  const pending = React.useRef<{
    key: CollectionKey;
    next?: HTMLElement;
    previous?: HTMLElement;
    removed: HTMLElement;
  } | null>(null);
  const model = useCollectionModel({
    selectionMode,
    selectedKeys,
    defaultSelectedKeys,
    disabledKeys,
    onSelectionChange,
  });
  const remove = React.useCallback(
    (key: CollectionKey) => {
      if (disabled || disabledKeys?.has(key)) return;
      const nodes = [
        ...(root.current?.querySelectorAll<HTMLElement>(
          '[data-collection-item="tag"]:not([aria-disabled="true"])',
        ) ?? []),
      ];
      const current = model.getNode(key);
      if (!current) return;
      const index = nodes.indexOf(current);
      pending.current = {
        key,
        next: nodes[index + 1],
        previous: nodes[index - 1],
        removed: current,
      };
      if (collection) {
        const next = collection.filter((item) => item.key !== key);
        if (items === undefined) setInternal(next);
        onItemsChange?.(next);
      } else if (!onRemove) {
        setRemoved((previous) => new Set([...previous, key]));
      }
      onRemove?.(new Set([key]));
    },
    [disabled, disabledKeys, model, collection, items, onItemsChange, onRemove],
  );
  // A controlled owner may decline or defer removal. Restore focus only after its DOM commit.
  React.useLayoutEffect(() => {
    const request = pending.current;
    if (!request || request.removed.isConnected) return;
    pending.current = null;
    model.deselect(request.key);
    const target = request.next?.isConnected
      ? request.next
      : request.previous?.isConnected
        ? request.previous
        : root.current;
    target?.focus();
  });
  const compiled = stylex.props(tagGroupStyles.root, xstyle);
  const groupValue = React.useMemo(
    () => ({
      items: collection,
      removed,
      size,
      variant,
      disabled,
      removable: !!collection || !!onRemove || !!onItemsChange,
    }),
    [collection, removed, size, variant, disabled, onRemove, onItemsChange],
  );
  const collectionValue = React.useMemo(() => ({ ...model, remove }), [model, remove]);
  return (
    <TagGroupContext.Provider value={groupValue}>
      <CollectionContext.Provider value={collectionValue}>
        <CollectionElement
          render={render}
          {...props}
          {...compiled}
          ref={(value) => {
            root.current = value;
            if (typeof ref === "function") return ref(value);
            if (ref) ref.current = value;
          }}
          style={{ ...compiled.style, ...style }}
          role="grid"
          aria-multiselectable={selectionMode === "multiple" || undefined}
          data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "tag-group"}
          tabIndex={!disabled && model.active === null ? 0 : -1}
          aria-disabled={disabled || undefined}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (
              event.defaultPrevented ||
              disabled ||
              (event.target as HTMLElement).closest("button,input,a,textarea,select")
            )
              return;
            if ((event.key === "Delete" || event.key === "Backspace") && model.active !== null) {
              event.preventDefault();
              remove(model.active);
            } else model.keyDown(event);
          }}
        >
          {children}
        </CollectionElement>
      </CollectionContext.Provider>
    </TagGroupContext.Provider>
  );
}
export interface TagGroupListProps extends StyleXProps<
  Omit<React.ComponentPropsWithRef<"div">, "children">
> {
  children?: React.ReactNode | ((item: CollectionItem) => React.ReactNode);
}
export function TagGroupList({ children, xstyle, style, ...props }: TagGroupListProps) {
  const group = React.useContext(TagGroupContext);
  const compiled = stylex.props(tagGroupStyles.list, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "tag-group-list"}
      role="presentation"
    >
      {typeof children === "function"
        ? group.items?.map((item) => (
            <React.Fragment key={`${typeof item.key}:${String(item.key)}`}>
              {children(item)}
            </React.Fragment>
          ))
        : children}
    </div>
  );
}
export const TagGroup = Object.assign(TagGroupRoot, { Root: TagGroupRoot, List: TagGroupList });
