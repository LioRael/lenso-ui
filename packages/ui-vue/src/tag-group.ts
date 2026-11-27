import {
  tagGroup,
  createModelController,
  type ModelController,
  type ModelChangeReason,
} from "@lenso/primitives/model-control";
import type { TableKey } from "@lenso/primitives/table/core";
import { tagGroupStyles } from "@lenso/tokens/tag-group";
import { createTypeahead, isTypeaheadKey, type ChangeDetails } from "@ui-sdk/core";
import { usePrimitive, usePart, type PrimitiveHandle } from "@ui-sdk/vue/primitive";
import {
  defineComponent,
  Fragment,
  h,
  inject,
  createVNode,
  useSlots,
  provide,
  shallowRef,
  watchPostEffect,
  type HTMLAttributes,
  type InjectionKey,
  type PropType,
  type ShallowRef,
  type SlotsType,
  type VNodeChild,
} from "vue";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

export { createModelController as createTagGroupController };
export type TagGroupItem = { key: TableKey; textValue: string; disabled?: boolean };
type SelectionChange = (keys: Set<TableKey>, details?: ChangeDetails<ModelChangeReason>) => void;
const options = {
  items: Array as PropType<readonly TagGroupItem[]>,
  defaultItems: Array as PropType<readonly TagGroupItem[]>,
  onItemsChange: Function as PropType<(items: TagGroupItem[]) => void>,
  onRemove: Function as PropType<(keys: Set<TableKey>) => void>,
  selectedKeys: Set as PropType<ReadonlySet<TableKey>>,
  defaultSelectedKeys: Set as PropType<ReadonlySet<TableKey>>,
  disabledKeys: Set as PropType<ReadonlySet<TableKey>>,
  onSelectionChange: Function as PropType<SelectionChange>,
  selectionMode: String as PropType<"none" | "single" | "multiple">,
  controller: Object as PropType<ModelController>,
  disabled: Boolean,
  size: String as PropType<"sm" | "md" | "lg">,
  variant: String as PropType<"default" | "surface">,
};
export const tagId = (key: TableKey) => typeof key + ":" + String(key);
type GroupOptions = Readonly<import("vue").ExtractPropTypes<typeof options>>;
interface TagGroupModel {
  handle: PrimitiveHandle<typeof tagGroup>;
  props: GroupOptions;
  items: () => readonly TagGroupItem[] | undefined;
  selected: () => ReadonlySet<TableKey>;
  root: ShallowRef<HTMLElement | undefined>;
  isRemoved(key: TableKey): boolean;
  register(key: TableKey, node: HTMLElement, disabled: boolean): () => void;
  keyForId(id: string): TableKey | undefined;
  select(key: TableKey, event: Event, from?: string): void;
  remove(key: TableKey): void;
}
function model(props: GroupOptions, update: (keys: Set<TableKey>) => void): TagGroupModel {
  const local = shallowRef(new Set(props.defaultSelectedKeys));
  const removed = shallowRef(new Set<TableKey>());
  const owned = shallowRef(props.defaultItems);
  const items = () => props.items ?? owned.value;
  const selected = () => props.selectedKeys ?? local.value;
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
      if (!details.canceled) {
        if (!props.selectedKeys) local.value = keys;
        update(keys);
      }
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
  const pending = new Map<HTMLElement, () => void>();
  const root = shallowRef<HTMLElement>();
  watchPostEffect((cleanup) => {
    if (!root.value) return;
    const observer = new MutationObserver(() => {
      for (const [node, settle] of pending) {
        if (!node.isConnected) {
          pending.delete(node);
          settle();
        }
      }
    });
    observer.observe(root.value, { childList: true, subtree: true });
    cleanup(() => {
      observer.disconnect();
      pending.clear();
    });
  });
  return {
    handle,
    props,
    items,
    selected,
    root,
    isRemoved: (key) => removed.value.has(key),
    register(key: TableKey, node: HTMLElement, disabled: boolean) {
      const id = tagId(key);
      nodes.set(id, { key, node });
      const stop = handle.api.bind(node, id, disabled);
      return () => {
        nodes.delete(id);
        stop();
      };
    },
    keyForId: (id: string) => nodes.get(id)?.key,
    select(key: TableKey, event: Event, from?: string) {
      const id = tagId(key);
      const keys = new Set([...selected()].map(tagId));
      if (props.selectionMode === "single") {
        keys.clear();
        keys.add(id);
      } else if (props.selectionMode === "multiple") {
        if ("shiftKey" in event && event.shiftKey) {
          const order = handle.api.roving.items().map((x) => x.key);
          const j = order.indexOf(id);
          const previous = order.indexOf(anchor ?? from ?? id);
          const i = previous < 0 ? j : previous;
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
          if (!props.selectedKeys) local.value = next;
          update(next);
        }
        if (document.activeElement === document.body || root?.contains(document.activeElement))
          (
            neighbors.map((id) => nodes.get(id)?.node).find((el) => el?.isConnected) ?? root
          )?.focus();
      });
      const collection = items();
      if (collection) {
        const next = collection.filter((x) => x.key !== key);
        if (!props.items) owned.value = next;
        props.onItemsChange?.(next);
      } else if (!props.onRemove) removed.value = new Set([...removed.value, key]);
      props.onRemove?.(new Set([key]));
    },
  };
}

export const TagGroupContext: InjectionKey<ReturnType<typeof model>> = Symbol("TagGroup");

const Group = defineComponent({
  name: "LensoTagGroup",
  inheritAttrs: false,
  props: options,
  emits: { "update:selectedKeys": (_keys: Set<TableKey>) => true },
  setup(props, { attrs, emit }) {
    const group = model(props, (keys) => emit("update:selectedKeys", keys));
    provide(TagGroupContext, group);
    return usePart(
      group.handle,
      "root",
      undefined,
      () => ({
        ...partAttributes("tag-group", tagGroupStyles.root, {
          ...attrs,
          role: "grid",
          "aria-multiselectable": props.selectionMode === "multiple" ? "true" : undefined,
          tabindex: props.disabled || group.handle.state.focused !== null ? -1 : 0,
        }),
        onVnodeMounted: ({ el }: import("vue").VNode) => {
          if (el instanceof HTMLElement) group.root.value = el;
        },
      }),
      "div",
    );
  },
});
export const TagGroupRoot: StyledPart<
  typeof Group,
  Omit<HTMLAttributes, "onSelectionChange">
> = Group as unknown as StyledPart<typeof Group, Omit<HTMLAttributes, "onSelectionChange">>;
export type TagGroupRootProps = ComponentProps<typeof TagGroupRoot>;

const List = defineComponent({
  name: "LensoTagGroupList",
  inheritAttrs: false,
  slots: Object as SlotsType<{ default: (item: TagGroupItem) => VNodeChild }>,
  setup(_, { attrs, slots }) {
    const group = inject(TagGroupContext, undefined);
    const staticSlots = useSlots();
    return () => {
      const items = group?.items();
      return h(
        "ul",
        partAttributes("tag-group-list", tagGroupStyles.list, {
          ...attrs,
          role: group ? "presentation" : attrs["role"],
        }),
        items
          ? items.map((item) =>
              createVNode(Fragment, { key: tagId(item.key) }, [slots.default?.(item)]),
            )
          : staticSlots["default"]?.(),
      );
    };
  },
});
export const TagGroupList: StyledPart<typeof List, HTMLAttributes> = List as unknown as StyledPart<
  typeof List,
  HTMLAttributes
>;
export const TagGroup: typeof TagGroupRoot & {
  Root: typeof TagGroupRoot;
  List: typeof TagGroupList;
} = Object.assign(TagGroupRoot, { Root: TagGroupRoot, List: TagGroupList });

export type TagGroupController = ModelController;
