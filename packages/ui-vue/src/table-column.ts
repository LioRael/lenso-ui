import type { ColumnWidth, TableKey } from "@lenso/primitives/table/core";
import { tableStyles as s } from "@lenso/tokens/table";
import { isRTL } from "@ui-sdk/core";
import {
  defineComponent,
  h,
  inject,
  mergeProps,
  provide,
  shallowRef,
  watch,
  watchPostEffect,
  type PropType,
  type SlotsType,
  type ThHTMLAttributes,
  type VNodeChild,
} from "vue";
import { partAttributes, type ComponentProps, type HtmlPart, type StyledPart } from "./parts.js";
import { ColumnState, keyType, TableModel, useTableVariant } from "./table-context.js";
import type { SortDescriptor } from "./table-state.js";

const Column = defineComponent({
  name: "LensoTableColumn",
  inheritAttrs: false,
  props: {
    columnKey: keyType as PropType<TableKey>,
    allowsSorting: Boolean,
    width: [Number, String] as PropType<ColumnWidth>,
    minWidth: Number,
    maxWidth: Number,
  },
  slots: Object as SlotsType<{
    default?: (scope: { sortDirection?: SortDescriptor["direction"] }) => VNodeChild;
  }>,
  setup(props, { attrs, slots }) {
    const table = inject(TableModel, undefined);
    const variant = useTableVariant();
    const node = shallowRef<HTMLTableCellElement>();
    const measured = shallowRef(160);
    const key = () => props.columnKey;
    const min = () => props.minWidth ?? 48;
    const max = () => props.maxWidth ?? 2000;
    const resolved = () => (key() === undefined ? undefined : table?.widths().get(key()!));
    const width = () =>
      resolved() ?? (typeof props.width === "number" ? props.width : measured.value);
    const sortable = () => props.allowsSorting && !!table && key() !== undefined;
    const sort = () => {
      if (sortable()) table?.sortBy(key()!);
    };

    provide(ColumnState, {
      width,
      min,
      max,
      resize(value) {
        if (key() !== undefined) table?.resize(key()!, Math.min(max(), Math.max(min(), value)));
      },
    });
    watch(
      [key, () => props.width, min, max],
      ([column, columnWidth, minWidth, maxWidth], _, cleanup) => {
        if (table && column !== undefined)
          cleanup(
            table.registerColumn({
              key: column,
              width: columnWidth,
              min: minWidth,
              max: maxWidth,
            }),
          );
      },
      { immediate: true, flush: "post" },
    );
    watchPostEffect((cleanup) => {
      const cell = node.value;
      if (!cell || key() === undefined || !table) return;
      const observer = new ResizeObserver(([entry]) => {
        if (entry) measured.value = entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width;
      });
      observer.observe(cell);
      cleanup(() => observer.disconnect());
    });
    return () => {
      const descriptor = table?.sort();
      const sortDirection =
        descriptor && descriptor.column === key() ? descriptor.direction : undefined;
      const columnWidth = resolved() ?? props.width;
      const cssWidth =
        typeof columnWidth === "number"
          ? columnWidth + "px"
          : columnWidth?.endsWith("fr")
            ? undefined
            : columnWidth;
      const sizing = {
        ...(cssWidth !== undefined && { width: cssWidth }),
        ...(props.minWidth !== undefined && { minWidth: props.minWidth + "px" }),
        ...(props.maxWidth !== undefined && { maxWidth: props.maxWidth + "px" }),
      };
      return h(
        "th",
        mergeProps(
          partAttributes(
            "table-column",
            [
              s.column,
              (sortable() || !!attrs["aria-sort"]) && s.sortableColumn,
              variant() === "secondary" && s.secondaryColumn,
            ],
            {
              scope: "col",
              tabindex: table && key() !== undefined ? 0 : undefined,
              ...attrs,
              "aria-sort": sortable() ? (sortDirection ?? "none") : attrs["aria-sort"],
              "data-allows-sorting": sortable() ? "" : undefined,
              style: [attrs["style"], sizing],
            },
          ),
          {
            ref: node,
            onClick(event: MouseEvent) {
              if (!event.defaultPrevented) sort();
            },
            onKeydown(event: KeyboardEvent) {
              if (event.defaultPrevented || event.target !== event.currentTarget || !sortable())
                return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                sort();
              }
            },
          },
        ),
        [slots.default?.({ sortDirection })],
      );
    };
  },
});
export const TableColumn: StyledPart<
  typeof Column,
  Omit<ThHTMLAttributes, "width">
> = Column as unknown as StyledPart<typeof Column, Omit<ThHTMLAttributes, "width">>;
export type TableColumnProps = ComponentProps<typeof TableColumn>;

type IndicatorProps = {
  sortDirection?: SortDescriptor["direction"];
  showIndicator?: boolean;
};
export const TableSortableColumnHeader: HtmlPart<"span", IndicatorProps> = defineComponent({
  name: "LensoTableSortableColumnHeader",
  inheritAttrs: false,
  props: {
    sortDirection: String as PropType<SortDescriptor["direction"]>,
    showIndicator: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h("span", partAttributes("table-sortable-column-header", s.sortableColumnHeader, attrs), [
        slots["default"]?.(),
        props.sortDirection &&
          props.showIndicator &&
          h(
            "span",
            partAttributes(
              "table-column-sort-indicator",
              [s.sortableColumnIndicator, props.sortDirection === "descending" && s.descending],
              { "aria-hidden": "true", "data-direction": props.sortDirection },
            ),
            [
              slots["indicator"]?.() ??
                h("svg", { viewBox: "0 0 16 16", width: 12, height: 12, fill: "none" }, [
                  h("path", {
                    d: "m4 10 4-4 4 4",
                    stroke: "currentColor",
                    "stroke-width": "1.5",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                  }),
                ]),
            ],
          ),
      ]);
  },
}) as unknown as HtmlPart<"span", IndicatorProps>;

export const TableColumnResizer: HtmlPart<"span"> = defineComponent({
  name: "LensoTableColumnResizer",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const column = inject(ColumnState, undefined);
    if (!column) throw new Error("Table.ColumnResizer requires Table.Column");
    let drag: { pointer: number; x: number; width: number; direction: number } | undefined;
    const release = (event: PointerEvent) => {
      if (drag?.pointer === event.pointerId) drag = undefined;
    };
    return () =>
      h(
        "span",
        mergeProps(
          partAttributes("table-column-resizer", s.columnResizer, {
            "aria-label": "Resize column",
            ...attrs,
            role: "separator",
            tabindex: 0,
            "aria-orientation": "vertical",
            "aria-valuemin": column.min(),
            "aria-valuemax": column.max(),
            "aria-valuenow": column.width(),
          }),
          {
            onClick: (event: MouseEvent) => event.stopPropagation(),
            onKeydown(event: KeyboardEvent) {
              event.stopPropagation();
              const target = event.currentTarget;
              if (event.defaultPrevented || !(target instanceof HTMLElement)) return;
              if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                column.resize(event.key === "Home" ? column.min() : column.max());
              } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                const grow = event.key === (isRTL(target) ? "ArrowLeft" : "ArrowRight");
                column.resize(column.width() + (grow ? 1 : -1) * (event.shiftKey ? 50 : 10));
              }
            },
            onPointerdown(event: PointerEvent) {
              event.stopPropagation();
              const target = event.currentTarget;
              if (
                event.defaultPrevented ||
                event.button !== 0 ||
                drag ||
                !(target instanceof HTMLElement)
              )
                return;
              target.setPointerCapture(event.pointerId);
              drag = {
                pointer: event.pointerId,
                x: event.clientX,
                width: column.width(),
                direction: isRTL(target) ? -1 : 1,
              };
            },
            onPointermove(event: PointerEvent) {
              if (drag?.pointer === event.pointerId && !event.defaultPrevented)
                column.resize(drag.width + (event.clientX - drag.x) * drag.direction);
            },
            onPointerup: release,
            onPointercancel: release,
            onLostpointercapture: release,
          },
        ),
        slots["default"]?.(),
      );
  },
}) as unknown as HtmlPart<"span">;
