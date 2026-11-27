import {
  collectionWindow,
  revealWindowRow,
  type TableKey,
  type WindowOptions,
} from "@lenso/primitives/table/core";
import { tableStyles as s } from "@lenso/tokens/table";
import {
  createVNode,
  defineComponent,
  Fragment,
  h,
  inject,
  provide,
  shallowRef,
  watch,
  watchPostEffect,
  type HTMLAttributes,
  type PropType,
  type VNodeChild,
} from "vue";
import { partAttributes, type SlotProps } from "./parts.js";
import {
  hasControl,
  TableModel,
  WindowIndex,
  useTableVariant,
  type CollectionItem,
} from "./table-context.js";

type CollectionSlot<T> = { default?: (item: T) => VNodeChild };
type CollectionProps<T, Options, Key extends PropertyKey> = HTMLAttributes &
  SlotProps &
  Options &
  Partial<Record<Key, readonly T[]>>;
type CollectionConstructor<Options, Key extends PropertyKey> = new <T extends CollectionItem>(
  props: CollectionProps<T, Options, Key>,
) => {
  $props: CollectionProps<T, Options, Key>;
  $slots: CollectionSlot<T>;
};
function entry(item: CollectionItem, slot: CollectionSlot<CollectionItem>["default"]) {
  return createVNode(Fragment, { key: typeof item.key + ":" + String(item.key) }, [slot?.(item)]);
}
const Items = {
  type: Array as PropType<readonly CollectionItem[]>,
};
export const TableCollection = defineComponent({
  name: "LensoTableCollection",
  props: { items: { ...Items, required: true } },
  setup(props, { slots }) {
    return () => props.items.map((item) => entry(item, slots["default"]));
  },
}) as unknown as new <T extends CollectionItem>(props: {
  items: readonly T[];
}) => {
  $props: { items: readonly T[] };
  $slots: CollectionSlot<T>;
};

export const TableHeader = defineComponent({
  name: "LensoTableHeader",
  inheritAttrs: false,
  props: { columns: Items },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "thead",
        partAttributes("table-header", s.header, attrs),
        props.columns
          ? [
              h(
                "tr",
                props.columns.map((column) => entry(column, slots["default"])),
              ),
            ]
          : slots["default"]?.(),
      );
  },
}) as unknown as CollectionConstructor<Record<never, never>, "columns">;

const WindowRow = defineComponent({
  props: { index: { type: Number, required: true } },
  setup(props, { slots }) {
    provide(WindowIndex, () => props.index);
    return () => slots["default"]?.();
  },
});
const scrollerSelector =
  '[data-lenso-slot="table-scroll-container"],[data-lenso-slot="table-resizable-container"]';
const Body = defineComponent({
  name: "LensoTableBody",
  inheritAttrs: false,
  props: {
    items: Items,
    virtualized: Object as PropType<WindowOptions>,
    onKeydown: Function as PropType<(event: KeyboardEvent) => void>,
    onFocusin: Function as PropType<(event: FocusEvent) => void>,
    onFocusout: Function as PropType<(event: FocusEvent) => void>,
  },
  setup(props, { attrs, slots }) {
    const table = inject(TableModel, undefined);
    const variant = useTableVariant();
    const body = shallowRef<HTMLTableSectionElement>();
    const focused = shallowRef<TableKey>();
    const offset = shallowRef(0);
    const viewport = () => body.value?.closest<HTMLElement>(scrollerSelector);
    const config = () => {
      const options = props.virtualized;
      return options &&
        Number.isFinite(options.height) &&
        Number.isFinite(options.rowHeight) &&
        options.height > 0 &&
        options.rowHeight > 0
        ? options
        : undefined;
    };
    watchPostEffect((cleanup) => {
      const node = viewport();
      const options = config();
      if (!node || !options) return;
      const update = () => {
        offset.value = Math.floor(node.scrollTop / options.rowHeight);
      };
      update();
      node.addEventListener("scroll", update, { passive: true });
      cleanup(() => node.removeEventListener("scroll", update));
    });

    let focusRequest = 0;
    function focusRow(index: number, column: number) {
      const item = props.items?.[index];
      const options = config();
      if (!item || !options) return;
      const request = ++focusRequest;
      focused.value = item.key;
      const node = viewport();
      if (node) {
        revealWindowRow(node, index, options);
        offset.value = Math.floor(node.scrollTop / options.rowHeight);
      }
      requestAnimationFrame(() => {
        if (request !== focusRequest || props.items?.[index]?.key !== item.key) return;
        const row = table?.rowFor(item.key);
        (row?.cells[column] ?? row?.cells[0])?.focus({ preventScroll: true });
      });
    }
    watch(
      () => config() && props.items,
      (items, _, cleanup) => {
        if (!items || !table) return;
        table.setWindowRows(items, (key) =>
          focusRow(
            items.findIndex((item) => item.key === key),
            0,
          ),
        );
        cleanup(() => table.setWindowRows(undefined));
      },
      { immediate: true },
    );

    function keydown(event: KeyboardEvent) {
      props.onKeydown?.(event);
      const items = props.items;
      if (
        !config() ||
        !items ||
        event.defaultPrevented ||
        hasControl(event.target) ||
        !(event.target instanceof Element)
      )
        return;
      const cell = event.target.closest<HTMLTableCellElement>("td");
      if (!cell) return;
      const position = items.findIndex((item) => table?.rowFor(item.key) === cell.parentElement);
      if (position < 0) return;
      const step =
        event.key === "ArrowDown" || (event.ctrlKey && event.key === "Home")
          ? 1
          : event.key === "ArrowUp" || (event.ctrlKey && event.key === "End")
            ? -1
            : 0;
      if (!step) return;
      let index =
        event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : position + step;
      while (items[index] && (items[index]!.disabled || table?.disabled(items[index]!.key)))
        index += step;
      const item = items[index];
      if (!item) return;
      event.preventDefault();
      if (event.shiftKey) table?.select(item.key, true);
      focusRow(index, cell.cellIndex);
    }

    function contents() {
      const items = props.items;
      const render = slots["default"];
      if (!items) return render?.();
      const options = config();
      if (!options) return items.map((item) => entry(item, render));
      const indices = collectionWindow(
        items.length,
        offset.value,
        options,
        items.findIndex((item) => item.key === focused.value),
      );
      function spacer(count: number, key: string) {
        return count > 0
          ? h("tr", { "aria-hidden": "true", key }, [
              h("td", {
                colspan: 1000,
                style: { height: count * options!.rowHeight + "px", padding: 0, border: 0 },
              }),
            ])
          : null;
      }
      return [
        ...indices.flatMap((index, position) => {
          const item = items[index]!;
          return [
            spacer(index - (position === 0 ? 0 : indices[position - 1]! + 1), "space-" + index),
            h(
              WindowRow,
              { key: typeof item.key + ":" + String(item.key), index },
              { default: () => render?.(item) },
            ),
          ];
        }),
        spacer(items.length - (indices.at(-1) ?? -1) - 1, "space-end"),
      ];
    }
    return () =>
      h(
        "tbody",
        {
          ...partAttributes(
            "table-body",
            [s.body, variant() === "secondary" && s.secondaryBody],
            attrs,
          ),
          ref: body,
          onKeydown: keydown,
          onFocusin(event: FocusEvent) {
            props.onFocusin?.(event);
            const row =
              event.target instanceof Element
                ? event.target.closest<HTMLTableRowElement>("[data-window-index]")
                : null;
            if (row && row.parentElement === body.value) {
              focused.value = props.items?.[Number(row.dataset["windowIndex"])]?.key;
            }
          },
          onFocusout(event: FocusEvent) {
            props.onFocusout?.(event);
            if (event.relatedTarget instanceof Node && !body.value?.contains(event.relatedTarget))
              focused.value = undefined;
          },
        },
        contents(),
      );
  },
});
export const TableBody = Body as unknown as CollectionConstructor<
  { virtualized?: WindowOptions },
  "items"
>;
