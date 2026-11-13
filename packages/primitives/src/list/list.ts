import {
  createChange,
  createController,
  createReorder,
  createSelection,
  definePrimitive,
  dispatch,
  type ChangeDetails,
  type ChangeOptions,
  type ReorderDraft,
  type SlotDefinition,
  type SwipeOpen,
} from "@ui-sdk/core";
export type ListKey = string | number | bigint;
export type ListReason = "item-press" | "list-navigation" | "item-removed" | "imperative";
export type ListMove = {
  keys: ReadonlySet<ListKey>;
  targetKey: ListKey;
  dropPosition: "before" | "after";
};
export type ListEntry = {
  key: ListKey;
  text: string;
  node: HTMLElement;
  disabled: boolean;
  group?: string;
};
export type ListController = {
  getValue(): string[];
  setValue(value: string[], options?: ChangeOptions<ListReason>): boolean;
  selectAll(options?: ChangeOptions<ListReason>): void;
  move(key: string, index: number): boolean;
};
export type ListOptions = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[], details: ChangeDetails<ListReason>) => void;
  onReorder?: (move: ListMove, details: ChangeDetails<"drag" | "move-key" | "imperative">) => void;
  editing?: boolean;
  disabled?: boolean;
  controller?: ListController;
};
type State = {
  value: string[];
  order: string[];
  reordering: ReorderDraft | null;
  open: SwipeOpen | null;
  editing: boolean;
  disabled: boolean;
};
type Api = ListController & {
  register(entry: ListEntry): () => void;
  entry(key: string): ListEntry | undefined;
  entries(): ListEntry[];
  setChecked(key: ListKey, checked: boolean, options?: ChangeOptions<ListReason>): void;
  setOpen(open: SwipeOpen | null): void;
  keydown(event: KeyboardEvent, key: ListKey): boolean;
  pointerdown(event: PointerEvent, key: ListKey): void;
  activate(key: ListKey): void;
  cancel(): void;
};
type Slots = { root: SlotDefinition<State, Api, {}, State> };
export const listKey = (key: ListKey) => `${typeof key}:${String(key)}`;
export function createListController() {
  return createController<ListController>();
}
export const list: ReturnType<typeof definePrimitive<ListOptions, State, Api, Slots>> =
  definePrimitive({
    name: "list",
    options: {
      value: "list",
      defaultValue: "list",
      onValueChange: "callback",
      onReorder: "callback",
      editing: "boolean",
      disabled: "boolean",
      controller: "value",
    },
    controlled: ["value"],
    state: (options: ListOptions): State => ({
      value: options.value ?? options.defaultValue ?? [],
      order: [],
      reordering: null,
      open: null,
      editing: !!options.editing,
      disabled: !!options.disabled,
    }),
    sync: (options) => ({
      ...(options.value === undefined ? {} : { value: options.value }),
      editing: !!options.editing,
      disabled: !!options.disabled,
    }),
    api: (context) => {
      const change = createChange(context);
      const entries = new Map<string, ListEntry>();
      const ordered = () =>
        [...entries.entries()].sort(([, a], [, b]) =>
          a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
        );
      const enabled = (key: string) => {
        const state = context.store.get();
        return state.editing && !state.disabled && entries.has(key) && !entries.get(key)!.disabled;
      };
      const setValue = (value: string[], options: ChangeOptions<ListReason> = {}) => {
        if (
          !context.store.get().editing ||
          context.store.get().disabled ||
          value.some((key) => !enabled(key))
        )
          return false;
        return change("value", value, { ...options, reason: options.reason ?? "imperative" });
      };
      const selection = createSelection<ListOptions, State, "value", ListReason>(context, {
        key: "value",
        set: setValue,
        order: () => context.store.get().order,
        multiple: () => true,
        selectable: enabled,
      });
      let moving: string | undefined;
      const reorder = createReorder<State, { disabled: boolean }>(context, {
        slot: "item",
        key: "order",
        draft: "reordering",
        preview: true,
        disabled: (item) => !context.options().onReorder || !enabled(item.key),
        label: (key) => entries.get(key)?.text,
        set(order, details) {
          const state = context.store.get();
          const source = state.reordering?.key ?? moving;
          if (!source || order.every((key, index) => key === state.order[index])) return false;
          const at = order.indexOf(source),
            before = at < state.order.indexOf(source);
          const target = order[at + (before ? 1 : -1)];
          if (!target || entries.get(source)?.group !== entries.get(target)?.group) return false;
          return !dispatch(
            context,
            "onReorder",
            {
              keys: new Set([entries.get(source)!.key]),
              targetKey: entries.get(target)!.key,
              dropPosition: before ? "before" : "after",
            } satisfies ListMove,
            details,
          );
        },
      });
      context.onOptions((options) => {
        if (!options.editing || options.disabled) reorder.cancel();
        if (options.editing || options.disabled) context.store.set({ open: null });
      });
      const refresh = () =>
        context.store.set({
          order: ordered()
            .filter(([, entry]) => !entry.disabled)
            .map(([key]) => key),
        });
      return {
        getValue: () => context.store.get().value,
        setValue,
        entries: () => ordered().map(([, entry]) => entry),
        entry: (key) => entries.get(key),
        register(entry) {
          const key = listKey(entry.key);
          if (entries.has(key)) throw new Error(`Duplicate List itemKey: ${String(entry.key)}`);
          entries.set(key, entry);
          const unbind = reorder.bind(entry.node, { key, props: { disabled: entry.disabled } });
          refresh();
          return () => {
            unbind();
            entries.delete(key);
            refresh();
            if (context.options().value === undefined)
              change(
                "value",
                context.store.get().value.filter((key) => entries.has(key)),
                { reason: "item-removed" },
              );
          };
        },
        setChecked(key, checked, options = {}) {
          const id = listKey(key);
          if (selection.isSelected(id) !== checked)
            selection.toggle(id, { ...options, reason: options.reason ?? "item-press" });
        },
        selectAll(options = {}) {
          selection.toggleAll({ ...options, reason: options.reason ?? "list-navigation" });
        },
        setOpen: (open) => {
          context.store.set({ open });
        },
        pointerdown: (event, key) => reorder.pointerdown(event, listKey(key)),
        keydown(event, key) {
          const handled = reorder.keydown(event, listKey(key));
          const draft = context.store.get().reordering;
          if (!draft) return handled;
          const group = entries.get(draft.key)?.group;
          const indices = context.store
            .get()
            .order.flatMap((key, index) => (entries.get(key)?.group === group ? [index] : []));
          const index = draft.order.indexOf(draft.key);
          if (indices.length && (index < indices[0]! || index > indices.at(-1)!))
            reorder.moveTo(Math.max(indices[0]!, Math.min(indices.at(-1)!, index)));
          return handled;
        },
        activate(key) {
          if (context.store.get().reordering) reorder.drop();
          else reorder.grab(listKey(key));
        },
        cancel: reorder.cancel,
        move(key, index) {
          moving = key;
          try {
            return reorder.move(key, index);
          } finally {
            moving = undefined;
          }
        },
      };
    },
    slots: (slot) => ({
      root: slot<{}, State>({
        state: (state) => state,
        attrs: (state) => ({
          "data-editing": state.editing ? "" : undefined,
          "data-disabled": state.disabled ? "" : undefined,
        }),
      }),
    }),
    agent: {
      actions: ["setValue", "selectAll", "move"],
      items: (api) =>
        api.entries().map((entry) => ({ value: listKey(entry.key), label: entry.text })),
    },
  });
