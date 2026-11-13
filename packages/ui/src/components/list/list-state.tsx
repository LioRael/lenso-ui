"use client";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  type Key,
  type KeyboardEvent,
} from "react";
import { usePrimitive, type PrimitiveHandle } from "@ui-sdk/react/primitive";
import {
  list,
  listKey,
  type ListEntry,
  type ListController,
  type ListReason,
} from "@lenso/primitives/list/core";
import type { ChangeDetails, ChangeOptions } from "@ui-sdk/core";
import type { CollectionDrop } from "../list-box/drag-and-drop.js";
export type ListReorderDetails = CollectionDrop;
export type ListEditingProps = {
  editing?: boolean;
  disabled?: boolean;
  value?: readonly Key[];
  defaultValue?: readonly Key[];
  onValueChange?: (keys: Key[], details: ChangeDetails<ListReason>) => void;
  onReorder?: (
    move: ListReorderDetails,
    details: ChangeDetails<"drag" | "move-key" | "imperative">,
  ) => void;
  controller?: ListController;
};
export type ListModel = {
  handle: PrimitiveHandle<typeof list>;
  editing: boolean;
  disabled: boolean;
  isSelected(key: Key): boolean;
  canReorder: boolean;
  open: { key: Key; side: "start" | "end" } | null;
  drag: { key: Key; target: { key: Key; position: "before" | "after" } | null } | null;
  instructionsId: string;
  register(entry: ListEntry): () => void;
  setChecked(key: Key, checked: boolean, options?: ChangeOptions<ListReason>): void;
  setOpen(open: { key: Key; side: "start" | "end" } | null): void;
  selectAll(event?: Event): void;
  pointerDown(key: Key, event: PointerEvent): void;
  keyDown(key: Key, handle: HTMLElement, event: KeyboardEvent<HTMLElement>): void;
  activateHandle(key: Key, handle: HTMLElement): void;
  blurHandle(key: Key): void;
  isOtherRow(target: Node): boolean;
  dismissOtherRow(target: Node): boolean;
};
export function useListEditing({
  value,
  defaultValue,
  onValueChange,
  ...options
}: ListEditingProps): ListModel {
  const handle = usePrimitive(list, {
    ...options,
    value: value?.map(listKey),
    defaultValue: defaultValue?.map(listKey),
    onValueChange(value, details) {
      onValueChange?.(
        value.map((key) => handle.api.entry(key)!.key),
        details,
      );
    },
  });
  useSyncExternalStore(handle.instance.subscribe, handle.instance.get, () => handle.state);
  const state = handle.state;
  const draft = state.reordering;
  const at = draft?.order.indexOf(draft.key) ?? -1;
  const before = draft ? at < state.order.indexOf(draft.key) : false;
  const target = draft?.order[at + (before ? 1 : -1)];
  const dragged = draft && handle.api.entry(draft.key);
  const destination = target && handle.api.entry(target);
  const openKey = state.open && handle.api.entry(state.open.key)?.key;
  const isOtherRow = (target: Node) =>
    !!state.open &&
    !state.editing &&
    target instanceof Element &&
    !target.closest(
      "[data-swipe-trigger],[data-swipe-action],[data-list-selection],[data-list-reorder]",
    ) &&
    handle.api
      .entries()
      .some((entry) => listKey(entry.key) !== state.open?.key && entry.node.contains(target));
  return {
    handle,
    editing: state.editing,
    disabled: state.disabled,
    canReorder: !!options.onReorder,
    isSelected: (key) => state.value.includes(listKey(key)),
    open:
      state.open && openKey !== null && openKey !== undefined
        ? { key: openKey, side: state.open.side }
        : null,
    drag: dragged
      ? {
          key: dragged.key,
          target:
            destination && at !== state.order.indexOf(draft!.key)
              ? { key: destination.key, position: before ? "before" : "after" }
              : null,
        }
      : null,
    instructionsId: `${handle.instance.id}-move`,
    register: handle.api.register,
    setChecked: handle.api.setChecked,
    setOpen: (open) => handle.api.setOpen(open && { key: listKey(open.key), side: open.side }),
    selectAll: (event) =>
      handle.api.selectAll({ reason: "list-navigation", ...(event ? { event } : {}) }),
    pointerDown: (key, event) => handle.api.pointerdown(event, key),
    keyDown(key, _handle, event) {
      if (handle.api.keydown(event.nativeEvent, key)) event.preventDefault();
    },
    activateHandle(key, element) {
      element.focus();
      handle.api.activate(key);
    },
    blurHandle(key) {
      if (state.reordering?.key === listKey(key) && !state.reordering.pointer) handle.api.cancel();
    },
    isOtherRow,
    dismissOtherRow(target) {
      if (!isOtherRow(target)) return false;
      handle.api.setOpen(null);
      return true;
    },
  };
}
export const ListContext = createContext<ListModel | null>(null);
export const ListSectionContext = createContext<string | undefined>(undefined);
export const ListRowContext = createContext({ editing: false, disabled: false });
export const useListContext = () => useContext(ListContext);
