import {
  tagGroup,
  createModelController,
  type ModelController,
  type ModelChangeReason,
} from "@lenso/primitives/model-control";
import type { TableKey } from "@lenso/primitives/table/core";
import { tagGroupStyles } from "@lenso/tokens/tag-group";
import { createTypeahead, isTypeaheadKey, type ChangeDetails } from "@ui-sdk/core";
import { usePrimitive, usePart, type PrimitiveHandle } from "@ui-sdk/solid/primitive";
import {
  createContext,
  createEffect,
  createSignal,
  For,
  merge,
  omit,
  useContext,
  type ComponentProps,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { htmlPart } from "./parts.js";
import { styled } from "./styled.js";
import * as stylex from "@stylexjs/stylex";

export { createModelController as createTagGroupController };
export type TagGroupItem = { key: TableKey; textValue: string; disabled?: boolean };
const List = htmlPart("ul", "tag-group-list", () => tagGroupStyles.list);
const Root = htmlPart("div", "tag-group", () => tagGroupStyles.root);
export type TagGroupRootProps = Omit<ComponentProps<typeof Root>, "onSelectionChange"> & {
  items?: readonly TagGroupItem[];
  defaultItems?: readonly TagGroupItem[];
  onItemsChange?: (items: TagGroupItem[]) => void;
  onRemove?: (keys: Set<TableKey>) => void;
  selectedKeys?: ReadonlySet<TableKey>;
  defaultSelectedKeys?: ReadonlySet<TableKey>;
  disabledKeys?: ReadonlySet<TableKey>;
  onSelectionChange?: (keys: Set<TableKey>, details?: ChangeDetails<ModelChangeReason>) => void;
  selectionMode?: "none" | "single" | "multiple";
  controller?: ModelController;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "surface";
};
export const tagId = (key: TableKey) => typeof key + ":" + String(key);
interface TagGroupModel {
  handle: PrimitiveHandle<typeof tagGroup>;
  props: TagGroupRootProps;
  items: () => readonly TagGroupItem[] | undefined;
  selected: () => ReadonlySet<TableKey>;
  state: () => ReturnType<typeof tagGroup>["types"]["state"];
  isRemoved(key: TableKey): boolean;
  register(key: TableKey, node: HTMLElement, disabled: boolean): () => void;
  select(key: TableKey, event: Event, from?: string): void;
  remove(key: TableKey): void;
  setRoot: (el: HTMLDivElement) => void;
}
function model(props: TagGroupRootProps): TagGroupModel {
  const [local, setLocal] = createSignal(new Set(props.defaultSelectedKeys));
  const [removed, setRemoved] = createSignal(new Set<TableKey>());
  const [owned, setOwned] = createSignal(props.defaultItems);
  const items = () => props.items ?? owned();
  const selected = () => props.selectedKeys ?? local();
  const nodes = new Map<string, { key: TableKey; node: HTMLElement }>();
  const search = createTypeahead();
  let anchor: string | undefined;
  const handle: PrimitiveHandle<typeof tagGroup> = usePrimitive(tagGroup, () => ({
    disabled: props.disabled,
    controller: props.controller,
    value: [...selected()].map(tagId),
    validate: (v) =>
      Array.isArray(v) &&
      !props.disabled &&
      !!props.selectionMode &&
      props.selectionMode !== "none" &&
      (props.selectionMode === "multiple" || v.length <= 1) &&
      v.every((k) => handle.api.roving.items().some((x) => x.key === k)),
    onValueChange(v, details) {
      if (!Array.isArray(v)) return details.cancel();
      const keys = new Set(v.flatMap((k) => (nodes.has(k) ? [nodes.get(k)!.key] : [])));
      props.onSelectionChange?.(keys, details);
      if (!details.canceled && !props.selectedKeys) setLocal(keys);
    },
    move(event, from) {
      const all = handle.api.roving.items();
      const i = all.findIndex((x) => x.key === from);
      if (isTypeaheadKey(event))
        return all[
          search(
            event.key,
            all.map((x) => x.el.getAttribute("aria-label") ?? ""),
            i,
          )
        ]?.key;
      const rtl =
        event.target instanceof HTMLElement && getComputedStyle(event.target).direction === "rtl";
      const step =
        event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")
          ? 1
          : event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft")
            ? -1
            : 0;
      return all[
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? all.length - 1
            : step
              ? Math.min(all.length - 1, Math.max(0, i + step))
              : -1
      ]?.key;
    },
  }));
  const [state, setState] = createSignal(handle.instance.get());
  createEffect(
    () => handle,
    (h) => {
      setState(h.instance.get());
      return h.instance.subscribe(() => setState(h.instance.get()));
    },
  );
  const pending = new Map<HTMLElement, () => void>();
  const [root, setRoot] = createSignal<HTMLDivElement>();
  createEffect(root, (element) => {
    if (!element) return;
    const observer = new MutationObserver(() => {
      for (const [node, settle] of pending)
        if (!node.isConnected) {
          pending.delete(node);
          settle();
        }
    });
    observer.observe(element, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      pending.clear();
    };
  });
  return {
    handle,
    props,
    items,
    selected,
    state,
    setRoot,
    isRemoved: (key) => removed().has(key),
    register(key: TableKey, node: HTMLElement, disabled: boolean) {
      const id = tagId(key);
      nodes.set(id, { key, node });
      const stop = handle.api.bind(node, id, disabled);
      return () => {
        nodes.delete(id);
        stop();
      };
    },
    select(key: TableKey, event: Event, from?: string) {
      const id = tagId(key);
      const keys = new Set([...selected()].map(tagId));
      if (props.selectionMode === "single") {
        keys.clear();
        keys.add(id);
      } else if (props.selectionMode === "multiple") {
        if ("shiftKey" in event && event.shiftKey) {
          const order = handle.api.roving.items().map((x) => x.key);
          const i = order.indexOf(anchor ?? from ?? id),
            j = order.indexOf(id);
          for (const k of order.slice(Math.min(i, j), Math.max(i, j) + 1)) keys.add(k);
        } else {
          anchor = id;
          if (keys.has(id)) keys.delete(id);
          else keys.add(id);
        }
      } else return;
      handle.api.setValue([...keys], { reason: "item-press", event });
    },
    remove(key: TableKey) {
      const node = nodes.get(tagId(key))?.node;
      if (!node) return;
      const ordered = handle.api.roving.items().map((x) => x.key);
      const i = ordered.indexOf(tagId(key));
      const root = node.closest<HTMLElement>('[data-lenso-slot="tag-group"]');
      const neighbors = [...ordered.slice(i + 1), ...ordered.slice(0, i).reverse()];
      pending.set(node, () => {
        if (node.isConnected) return;
        if (selected().has(key)) {
          const next = new Set(selected());
          next.delete(key);
          props.onSelectionChange?.(next);
          if (!props.selectedKeys) setLocal(next);
        }
        if (document.activeElement === document.body || root?.contains(document.activeElement))
          (
            neighbors.map((id) => nodes.get(id)?.node).find((el) => el?.isConnected) ?? root
          )?.focus();
      });
      const collection = items();
      if (collection) {
        const next = collection.filter((x) => x.key !== key);
        if (!props.items) setOwned(next);
        props.onItemsChange?.(next);
      } else if (!props.onRemove) setRemoved(new Set([...removed(), key]));
      props.onRemove?.(new Set([key]));
    },
  };
}
export const TagGroupContext = createContext<ReturnType<typeof model> | null>(null);
export function TagGroupRoot(props: TagGroupRootProps) {
  const group = model(props);
  const compiled = () => stylex.props(tagGroupStyles.root, props.xstyle);
  const rest = omit(
    props,
    "items",
    "defaultItems",
    "onItemsChange",
    "onRemove",
    "selectedKeys",
    "defaultSelectedKeys",
    "disabledKeys",
    "onSelectionChange",
    "selectionMode",
    "controller",
    "disabled",
    "size",
    "variant",
    "class",
    "style",
    "xstyle",
  );
  return (
    <TagGroupContext value={group}>
      {usePart(
        group.handle,
        "root",
        () => ({}),
        merge(rest, styled(compiled, props), {
          ref: [group.setRoot, props.ref],
          role: "grid" as const,
          "data-lenso-slot": "tag-group",
          get "aria-multiselectable"() {
            return props.selectionMode === "multiple" ? ("true" as const) : undefined;
          },
          get tabindex() {
            return props.disabled || group.state().focused !== null ? -1 : 0;
          },
        }),
        "div",
      )}
    </TagGroupContext>
  );
}
function TagGroupEntry(props: { item: TagGroupItem; render: (item: TagGroupItem) => JSX.Element }) {
  return <>{props.render(props.item)}</>;
}
export function TagGroupList(
  props: Omit<ComponentProps<typeof List>, "children"> & {
    children?: JSX.Element | ((item: TagGroupItem) => JSX.Element);
  },
) {
  const group = useContext(TagGroupContext);
  return (
    <List {...omit(props, "children")} role={group ? "presentation" : props.role}>
      {(() => {
        const child = props.children;
        return typeof child === "function" ? (
          <For each={group?.items() ?? []} keyed={(x) => x.key}>
            {(item) => <TagGroupEntry item={item()} render={child} />}
          </For>
        ) : (
          child
        );
      })()}
    </List>
  );
}
export const TagGroup = Object.assign(TagGroupRoot, { Root: TagGroupRoot, List: TagGroupList });
