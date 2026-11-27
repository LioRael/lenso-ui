import type { TableKey } from "@lenso/primitives/table/core";
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
  type PropType,
  type TdHTMLAttributes,
  type VNodeChild,
  type SlotsType,
} from "vue";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";
import {
  hasControl,
  keyType,
  RowState,
  TableModel,
  TreeParent,
  useTableVariant,
  WindowIndex,
} from "./table-context.js";

const Children = defineComponent({
  props: {
    level: { type: Number, required: true },
    parent: Function as PropType<() => TableKey | undefined>,
  },
  setup(props, { slots }) {
    provide(TreeParent, { level: props.level, key: () => props.parent?.() });
    return () => slots["default"]?.();
  },
});

const Row = defineComponent({
  name: "LensoTableRow",
  inheritAttrs: false,
  props: {
    itemKey: keyType as PropType<TableKey>,
    disabled: Boolean,
    expandedColSpan: { type: Number, default: 1 },
  },
  slots: Object as SlotsType<{
    default?: () => VNodeChild;
    childRows?: () => VNodeChild;
    expandedContent?: () => VNodeChild;
  }>,
  setup(props, { attrs, slots }) {
    const table = inject(TableModel, undefined);
    const index = inject(WindowIndex, undefined);
    const parent = inject(TreeParent, undefined);
    const level = (parent?.level ?? 0) + 1;
    const node = shallowRef<HTMLTableRowElement>();
    const key = () => props.itemKey;
    const disabled = () => props.disabled || (key() !== undefined && !!table?.disabled(key()!));
    const expanded = () => key() !== undefined && !!table?.expanded().has(key()!);
    const selected = () => key() !== undefined && !!table?.selected().has(key()!);
    provide(RowState, { key, disabled, expanded });
    watch(
      [node, key],
      ([row, item], _, cleanup) => {
        if (table && row && item !== undefined) cleanup(table.registerRow(item, row, disabled));
      },
      { flush: "post" },
    );

    function keydown(event: KeyboardEvent) {
      const id = key();
      const row = node.value;
      if (!table || !row || id === undefined || disabled() || event.defaultPrevented) return;
      if (table.drag.keyDown(event, id)) return;
      if (
        event.target instanceof Element &&
        event.target.closest("[data-tree-column]") &&
        !hasControl(event.target)
      ) {
        const forward = isRTL(row) ? "ArrowLeft" : "ArrowRight";
        if (event.key === forward && slots.childRows) {
          event.preventDefault();
          if (expanded())
            row.nextElementSibling?.querySelector<HTMLElement>("[data-tree-column]")?.focus();
          else table.toggleExpanded(id);
        } else if (event.key === (forward === "ArrowLeft" ? "ArrowRight" : "ArrowLeft")) {
          if (expanded()) {
            event.preventDefault();
            table.toggleExpanded(id);
          } else if (parent?.key() !== undefined) {
            event.preventDefault();
            table.focus(parent.key()!);
          }
        }
      }
      if (
        !event.defaultPrevented &&
        table.mode() !== "none" &&
        !hasControl(event.target) &&
        (event.key === " " || event.key === "Enter")
      ) {
        event.preventDefault();
        table.select(id);
      }
    }

    return () => {
      const id = key();
      const hidden = disabled();
      const canDrag = id !== undefined && table?.drag.enabled() && !hidden;
      const managed = id !== undefined && table && table.mode() !== "none";
      const tree = table?.treeColumn() !== undefined && id !== undefined;
      const open = expanded();
      return [
        h(
          "tr",
          mergeProps(
            partAttributes("table-row", [s.row, hidden && s.disabled], {
              ...attrs,
              "aria-rowindex": attrs["aria-rowindex"] ?? (index ? index() + 2 : undefined),
              "data-window-index": index?.(),
              "aria-level": tree ? level : attrs["aria-level"],
              draggable: canDrag ? "true" : attrs["draggable"],
              "aria-disabled": hidden ? "true" : attrs["aria-disabled"],
              "aria-selected": managed ? String(selected()) : attrs["aria-selected"],
              "aria-expanded":
                slots.childRows || slots.expandedContent ? String(open) : attrs["aria-expanded"],
            }),
            {
              ref: node,
              onClick(event: MouseEvent) {
                if (
                  !event.defaultPrevented &&
                  !hidden &&
                  id !== undefined &&
                  !hasControl(event.target)
                )
                  table?.select(id, event.shiftKey);
              },
              onKeydown: keydown,
              onDragstart(event: DragEvent) {
                if (!event.defaultPrevented && id !== undefined && table?.drag.enabled())
                  table.drag.start(event, id);
              },
              onDragover(event: DragEvent) {
                if (!event.defaultPrevented && id !== undefined) table?.drag.over(event, id);
              },
              onDrop(event: DragEvent) {
                if (!event.defaultPrevented && id !== undefined && node.value)
                  table?.drag.drop(event, id, node.value);
              },
              onDragend: () => table?.drag.end(),
            },
          ),
          [slots.default?.()],
        ),
        open &&
          slots.childRows &&
          h(Children, { level, parent: key }, { default: slots.childRows }),
        open &&
          slots.expandedContent &&
          h("tr", { "data-lenso-slot": "table-expanded-row" }, [
            h("td", { colspan: props.expandedColSpan }, [slots.expandedContent()]),
          ]),
      ];
    };
  },
});
export const TableRow: StyledPart<typeof Row, import("vue").HTMLAttributes> =
  Row as unknown as StyledPart<typeof Row, import("vue").HTMLAttributes>;
export type TableRowProps = ComponentProps<typeof TableRow>;

const Cell = defineComponent({
  name: "LensoTableCell",
  inheritAttrs: false,
  props: { columnKey: keyType as PropType<TableKey> },
  setup(props, { attrs, slots }) {
    const table = inject(TableModel, undefined);
    const row = inject(RowState, undefined);
    const variant = useTableVariant();
    return () => {
      const id = row?.key();
      const treeColumn = table?.treeColumn();
      return h(
        "td",
        partAttributes(
          "table-cell",
          [
            s.cell,
            variant() === "secondary" && s.secondaryCell,
            id !== undefined && table?.selected().has(id) && s.selectedCell,
          ],
          {
            tabindex: id === undefined ? undefined : row?.disabled() ? -1 : 0,
            ...attrs,
            role: treeColumn !== undefined ? "gridcell" : attrs["role"],
            "data-tree-column":
              props.columnKey !== undefined && props.columnKey === treeColumn ? "" : undefined,
          },
        ),
        slots["default"]?.(),
      );
    };
  },
});
export const TableCell: StyledPart<typeof Cell, TdHTMLAttributes> = Cell as unknown as StyledPart<
  typeof Cell,
  TdHTMLAttributes
>;
