import { type ButtonActionDetails } from "@ui-sdk/vue/button";
import {
  defineComponent,
  h,
  inject,
  mergeProps,
  shallowRef,
  watchPostEffect,
  type PropType,
} from "vue";
import { Button, type ButtonProps } from "./button.js";
import { partAttributes, type HtmlPart } from "./parts.js";
import { RowState, TableModel } from "./table-context.js";

export const TableSelectionCheckbox: HtmlPart<"input"> = defineComponent({
  name: "LensoTableSelectionCheckbox",
  inheritAttrs: false,
  setup(_, { attrs }) {
    const table = inject(TableModel, undefined);
    const row = inject(RowState, undefined);
    const managed = () => !!table && table.mode() !== "none" && (!row || row.key() !== undefined);
    const checked = () => {
      if (!managed() || !table) return attrs["checked"];
      if (row) return table.selected().has(row.key()!);
      const keys = table.enabledKeys();
      return keys.length > 0 && keys.every((key) => table.selected().has(key));
    };
    return () =>
      h(
        "input",
        mergeProps(
          partAttributes("table-selection-checkbox", undefined, {
            "aria-label": row ? "Select row" : "Select all",
            ...attrs,
            type: "checkbox",
            checked: checked(),
            ".indeterminate":
              managed() &&
              !row &&
              !checked() &&
              !!table?.enabledKeys().some((key) => table.selected().has(key)),
            disabled:
              attrs["disabled"] ||
              row?.disabled() ||
              (managed() && !row && table?.mode() === "single"),
          }),
          {
            onChange(event: Event) {
              if (!managed() || !table || !(event.currentTarget instanceof HTMLInputElement))
                return;
              const input = event.currentTarget;
              if (!event.defaultPrevented) {
                if (row) table.select(row.key()!);
                else table.selectAll(input.checked);
              }
              queueMicrotask(() => {
                input.checked = Boolean(checked());
              });
            },
          },
        ),
      );
  },
}) as unknown as HtmlPart<"input">;

export const TableExpandButton: typeof Button.Root = defineComponent({
  name: "LensoTableExpandButton",
  inheritAttrs: false,
  props: { disabled: Boolean, onClick: Function as PropType<ButtonProps["onClick"]> },
  setup(props, { attrs, slots }) {
    const table = inject(TableModel, undefined);
    const row = inject(RowState, undefined);
    return () =>
      h(
        Button,
        {
          isIconOnly: true,
          size: "sm",
          variant: "borderless",
          "aria-label": row?.expanded() ? "Collapse row" : "Expand row",
          ...attrs,
          "data-lenso-slot": "table-expand-button",
          "aria-expanded":
            row?.key() !== undefined
              ? row.expanded()
                ? "true"
                : "false"
              : (attrs["aria-expanded"] as "true" | "false" | undefined),
          disabled: props.disabled || row?.disabled(),
          onClick(event: MouseEvent, details: ButtonActionDetails) {
            event.stopPropagation();
            const result = props.onClick?.(event, details);
            const key = row?.key();
            if (!event.defaultPrevented && key !== undefined && !row?.disabled())
              table?.toggleExpanded(key);
            return result;
          },
        },
        { ...slots, default: slots["default"] ?? (() => (row?.expanded() ? "−" : "+")) },
      );
  },
}) as unknown as typeof Button.Root;

type LoadOptions = {
  colSpan?: number;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
};
export const TableLoadMore: HtmlPart<"tr", LoadOptions> = defineComponent({
  name: "LensoTableLoadMore",
  inheritAttrs: false,
  props: {
    colSpan: { type: Number, default: 1 },
    onLoadMore: Function as PropType<() => void>,
    loading: Boolean,
    hasMore: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots }) {
    const row = shallowRef<HTMLTableRowElement>();
    watchPostEffect((cleanup) => {
      const node = row.value;
      if (!node || props.loading || !props.hasMore || !props.onLoadMore) return;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) props.onLoadMore?.();
      });
      observer.observe(node);
      cleanup(() => observer.disconnect());
    });
    return () =>
      h(
        "tr",
        {
          ...partAttributes("table-load-more", undefined, {
            ...attrs,
            "aria-busy": props.loading ? "true" : undefined,
          }),
          ref: row,
        },
        [h("td", { colspan: props.colSpan }, slots["default"]?.())],
      );
  },
}) as unknown as HtmlPart<"tr", LoadOptions>;
