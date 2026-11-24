import type { ColumnWidth, TableKey } from "@lenso/primitives/table/core";
import { tableStyles as s } from "@lenso/tokens/table";
import type { JSX } from "@solidjs/web";
import { isRTL } from "@ui-sdk/core";
import {
  createContext,
  createEffect,
  createSignal,
  For,
  omit,
  Show,
  useContext,
  type ComponentProps,
} from "solid-js";
import { Button, type ButtonProps } from "./button.jsx";
import { attributes, htmlPart } from "./parts.js";
import { createTableState, type SortDescriptor, type TableStateProps } from "./table-state.js";

export type { ColumnWidth, TableKey, SortDescriptor };

const State = createContext<ReturnType<typeof createTableState> | null>(null);
const Variant = createContext<() => "primary" | "secondary">(() => "primary");
const RowState = createContext<{
  key: () => TableKey | undefined;
  disabled: () => boolean;
  expanded: () => boolean;
} | null>(null);
const ColumnState = createContext<{
  width: () => number;
  min: () => number;
  max: () => number;
  resize: (width: number) => void;
} | null>(null);

function call<Event>(
  handler:
    | ((event: Event) => unknown)
    | { 0: (data: unknown, event: Event) => unknown; 1: unknown }
    | undefined,
  event: Event,
) {
  if (typeof handler === "function") handler(event);
  else handler?.[0](handler[1], event);
}

function hasControl(target: EventTarget | null) {
  return (
    target instanceof Element && target.closest("button,input,a,select,textarea,[role=separator]")
  );
}

const Root = htmlPart("div", "table", () => s.root);
const Content = htmlPart("table", "table-content", () => s.content);
const Header = htmlPart("thead", "table-header", () => s.header);
const Body = htmlPart("tbody", "table-body", () => s.body);
const Row = htmlPart("tr", "table-row", () => s.row);
const Column = htmlPart("th", "table-column", () => s.column);
const Cell = htmlPart("td", "table-cell", () => s.cell);
const Toggle = htmlPart("input", "table-selection-checkbox", () => undefined);
const SortLabel = htmlPart("span", "table-sortable-column-header", () => s.sortableColumnHeader);
const Resizer = htmlPart("span", "table-column-resizer", () => s.columnResizer);
const Sentinel = htmlPart("tr", "table-load-more", () => undefined);

export type TableRootProps = ComponentProps<typeof Root> & { variant?: "primary" | "secondary" };
export function TableRoot(props: TableRootProps) {
  const variant = () => props.variant ?? "primary";
  return (
    <Variant value={variant}>
      <Root
        {...omit(props, "variant", "xstyle")}
        xstyle={[variant() === "primary" && s.primary, props.xstyle]}
      />
    </Variant>
  );
}

export const TableScrollContainer = htmlPart(
  "div",
  "table-scroll-container",
  () => s.scrollContainer,
);
export const TableResizableContainer = htmlPart(
  "div",
  "table-resizable-container",
  () => s.scrollContainer,
);
export const TableFooter = htmlPart("div", "table-footer", () => s.footer);
export const TableLoadMoreContent = htmlPart(
  "div",
  "table-load-more-content",
  () => s.loadMoreContent,
);

export type TableContentProps = ComponentProps<typeof Content> & TableStateProps;
export function TableContent(props: TableContentProps) {
  const [node, setNode] = createSignal<HTMLTableElement>();
  const [available, setAvailable] = createSignal(0);
  const table = createTableState(props, available);
  createEffect(node, (element) => {
    if (!element) return;
    const measure = () =>
      setAvailable(
        Math.max(
          element.parentElement?.clientWidth ?? 0,
          parseFloat(getComputedStyle(element).minWidth) || 0,
        ),
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element.parentElement ?? element);
    return () => observer.disconnect();
  });

  const rest = omit(
    props,
    "ref",
    "style",
    "onKeyDown",
    "selectionMode",
    "selectedKeys",
    "defaultSelectedKeys",
    "disabledKeys",
    "onSelectionChange",
    "sortDescriptor",
    "defaultSortDescriptor",
    "onSortChange",
    "expandedKeys",
    "defaultExpandedKeys",
    "onExpandedChange",
    "columnWidths",
    "defaultColumnWidths",
    "onColumnWidthsChange",
  );
  return (
    <State value={table}>
      <Content
        {...rest}
        ref={[setNode, props.ref]}
        style={
          typeof props.style === "string"
            ? props.style + (table.fixedLayout() ? ";table-layout:fixed" : "")
            : { ...props.style, ...(table.fixedLayout() && { "table-layout": "fixed" }) }
        }
        onKeyDown={(event) => {
          call(props.onKeyDown, event);
          if (
            event.defaultPrevented ||
            hasControl(event.target) ||
            !(event.target instanceof Element)
          )
            return;
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "a" &&
            table.mode() === "multiple"
          ) {
            event.preventDefault();
            table.selectAll();
            return;
          }
          const cell = event.target.closest<HTMLTableCellElement>("td,th");
          if (!cell || cell.closest("table") !== event.currentTarget) return;
          const row = cell.parentElement as HTMLTableRowElement;
          const rows = [...event.currentTarget.rows].filter(
            (entry) => entry.getAttribute("aria-disabled") !== "true",
          );
          const i = rows.indexOf(row);
          const column = cell.cellIndex;
          const rtl = isRTL(event.currentTarget);
          let destination: HTMLTableCellElement | undefined;
          if (event.key === "ArrowDown") destination = rows[i + 1]?.cells[column];
          else if (event.key === "ArrowUp") destination = rows[i - 1]?.cells[column];
          else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight"))
            destination = row.cells[column + 1];
          else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft"))
            destination = row.cells[column - 1];
          else if (event.key === "Home") destination = (event.ctrlKey ? rows[0] : row)?.cells[0];
          else if (event.key === "End") {
            const last = event.ctrlKey ? rows.at(-1) : row;
            destination = last?.cells[last.cells.length - 1];
          }
          if (destination) {
            event.preventDefault();
            destination.focus();
          }
        }}
      />
    </State>
  );
}

type CollectionItem = { key: TableKey };
function TableCollectionItem<T>(props: { item: T; render: (item: T) => JSX.Element }) {
  return <>{props.render(props.item)}</>;
}

export function TableCollection<T extends CollectionItem>(props: {
  items: readonly T[];
  children: (item: T) => JSX.Element;
}) {
  return (
    <For each={props.items} keyed={(item) => item.key}>
      {(item) => <TableCollectionItem item={item()} render={props.children} />}
    </For>
  );
}
export function TableHeader<T extends CollectionItem>(
  props: Omit<ComponentProps<typeof Header>, "children"> & {
    columns?: readonly T[];
    children?: JSX.Element | ((column: T) => JSX.Element);
  },
) {
  return (
    <Header {...omit(props, "columns", "children")}>
      {(() => {
        const children = props.children;
        if (typeof children === "function")
          return (
            <tr>
              <TableCollection items={props.columns ?? []}>{children}</TableCollection>
            </tr>
          );
        return children;
      })()}
    </Header>
  );
}

export function TableBody<T extends CollectionItem>(
  props: Omit<ComponentProps<typeof Body>, "children"> & {
    items?: readonly T[];
    children?: JSX.Element | ((item: T) => JSX.Element);
  },
) {
  const variant = useContext(Variant);
  return (
    <Body
      {...omit(props, "items", "children", "xstyle")}
      xstyle={[variant() === "secondary" && s.secondaryBody, props.xstyle]}
    >
      {(() => {
        const children = props.children;
        return typeof children === "function" ? (
          <TableCollection items={props.items ?? []}>{children}</TableCollection>
        ) : (
          children
        );
      })()}
    </Body>
  );
}

export type TableColumnProps = Omit<ComponentProps<typeof Column>, "children" | "width"> & {
  columnKey?: TableKey;
  allowsSorting?: boolean;
  width?: ColumnWidth;
  minWidth?: number;
  maxWidth?: number;
  children?:
    | JSX.Element
    | ((state: { sortDirection?: SortDescriptor["direction"] }) => JSX.Element);
};
export function TableColumn(props: TableColumnProps) {
  const table = useContext(State);
  const variant = useContext(Variant);
  const [node, setNode] = createSignal<HTMLTableCellElement>();
  const [measured, setMeasured] = createSignal(160);
  const min = () => props.minWidth ?? 48;
  const max = () => props.maxWidth ?? 2000;
  const key = () => props.columnKey;
  const sortDirection = () => {
    const descriptor = table?.sort();
    return descriptor && descriptor.column === key() ? descriptor.direction : undefined;
  };
  const resolved = () => {
    const column = key();
    return column === undefined ? undefined : table?.widths().get(column);
  };
  const cssWidth = () => {
    const width = resolved() ?? props.width;
    return typeof width === "number" ? `${width}px` : width?.endsWith("fr") ? undefined : width;
  };
  const width = () => resolved() ?? (typeof props.width === "number" ? props.width : measured());
  function resize(pixelWidth: number) {
    const column = key();
    if (column !== undefined) table?.resize(column, Math.min(max(), Math.max(min(), pixelWidth)));
  }
  createEffect(
    () => [key(), props.width, min(), max()] as const,
    ([column, width, min, max]) =>
      column === undefined ? undefined : table?.registerColumn({ key: column, width, min, max }),
  );
  createEffect(
    () => [node(), key()] as const,
    ([element, column]) => {
      if (!element || !table || column === undefined) return;
      const observer = new ResizeObserver(([entry]) => {
        if (entry) setMeasured(entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width);
      });
      observer.observe(element);
      return () => observer.disconnect();
    },
  );
  const sortable = () => Boolean(props.allowsSorting && key() !== undefined && table);
  const sort = () => {
    if (sortable()) table?.sortBy(key()!);
  };

  return (
    <ColumnState value={{ width, min, max, resize }}>
      <Column
        scope="col"
        tabindex={table && key() !== undefined ? 0 : undefined}
        {...omit(
          props,
          "ref",
          "columnKey",
          "allowsSorting",
          "width",
          "minWidth",
          "maxWidth",
          "xstyle",
          "style",
          "children",
          "onClick",
          "onKeyDown",
        )}
        ref={[setNode, props.ref]}
        aria-sort={sortable() ? (sortDirection() ?? "none") : props["aria-sort"]}
        data-allows-sorting={sortable() ? "" : undefined}
        xstyle={[
          (sortable() || props["aria-sort"]) && s.sortableColumn,
          variant() === "secondary" && s.secondaryColumn,
          props.xstyle,
        ]}
        style={columnStyle(props.style, cssWidth(), props.minWidth, props.maxWidth)}
        onClick={(event) => {
          call(props.onClick, event);
          if (!event.defaultPrevented) sort();
        }}
        onKeyDown={(event) => {
          call(props.onKeyDown, event);
          if (event.defaultPrevented || event.target !== event.currentTarget || !sortable()) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            sort();
          }
        }}
      >
        {(() => {
          const children = props.children;
          return typeof children === "function"
            ? children({ sortDirection: sortDirection() })
            : children;
        })()}
      </Column>
    </ColumnState>
  );
}

function columnStyle(
  style: JSX.CSSProperties | string | false | undefined,
  width: string | undefined,
  min?: number,
  max?: number,
) {
  const sizes = {
    ...(width !== undefined && { width }),
    ...(min !== undefined && { "min-width": `${min}px` }),
    ...(max !== undefined && { "max-width": `${max}px` }),
  };
  return typeof style === "string"
    ? style +
        Object.entries(sizes)
          .map(([key, value]) => `;${key}:${value}`)
          .join("")
    : { ...style, ...sizes };
}

export type TableRowProps = ComponentProps<typeof Row> & {
  itemKey?: TableKey;
  disabled?: boolean;
  expandedContent?: JSX.Element;
  expandedColSpan?: number;
};

export function TableRow(props: TableRowProps) {
  const table = useContext(State);
  const [node, setNode] = createSignal<HTMLTableRowElement>();
  const key = () => props.itemKey;
  const disabled = () =>
    Boolean(props.disabled || (key() !== undefined && table?.disabled(key()!)));
  const expanded = () => key() !== undefined && Boolean(table?.expanded().has(key()!));
  const selected = () => key() !== undefined && Boolean(table?.selected().has(key()!));
  createEffect(
    () => [node(), key()] as const,
    ([row, item]) =>
      row && item !== undefined ? table?.registerRow(item, row, disabled) : undefined,
  );
  return (
    <RowState value={{ key, disabled, expanded }}>
      <Row
        {...omit(
          props,
          "ref",
          "itemKey",
          "disabled",
          "expandedContent",
          "expandedColSpan",
          "xstyle",
          "onClick",
          "onKeyDown",
        )}
        ref={[setNode, props.ref]}
        aria-disabled={disabled() ? "true" : props["aria-disabled"]}
        aria-selected={
          key() !== undefined && table && table.mode() !== "none"
            ? selected()
              ? "true"
              : "false"
            : props["aria-selected"]
        }
        aria-expanded={
          "expandedContent" in props ? (expanded() ? "true" : "false") : props["aria-expanded"]
        }
        xstyle={[disabled() && s.disabled, props.xstyle]}
        onClick={(event) => {
          call(props.onClick, event);
          if (
            !event.defaultPrevented &&
            !disabled() &&
            key() !== undefined &&
            !hasControl(event.target)
          )
            table?.select(key()!, event.shiftKey);
        }}
        onKeyDown={(event) => {
          call(props.onKeyDown, event);
          if (
            event.defaultPrevented ||
            disabled() ||
            key() === undefined ||
            !table ||
            table.mode() === "none" ||
            hasControl(event.target)
          )
            return;
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            table.select(key()!);
          }
        }}
      />
      <Show when={expanded() && "expandedContent" in props}>
        <tr data-lenso-slot="table-expanded-row">
          <td colspan={props.expandedColSpan ?? 1}>{props.expandedContent}</td>
        </tr>
      </Show>
    </RowState>
  );
}

export function TableCell(props: ComponentProps<typeof Cell>) {
  const table = useContext(State);
  const row = useContext(RowState);
  const variant = useContext(Variant);
  const selected = () => {
    const key = row?.key();
    return key !== undefined && table?.selected().has(key);
  };
  return (
    <Cell
      tabindex={row?.key() === undefined ? undefined : row.disabled() ? -1 : 0}
      {...omit(props, "xstyle")}
      xstyle={[
        variant() === "secondary" && s.secondaryCell,
        selected() && s.selectedCell,
        props.xstyle,
      ]}
    />
  );
}

export function TableSelectionCheckbox(props: ComponentProps<typeof Toggle>) {
  const table = useContext(State);
  const row = useContext(RowState);
  const managed = () =>
    Boolean(table && table.mode() !== "none" && (!row || row.key() !== undefined));
  const checked = () => {
    if (!managed() || !table) return props.checked;
    if (row) return table.selected().has(row.key()!);
    const keys = table.enabledKeys();
    return keys.length > 0 && keys.every((key) => table.selected().has(key));
  };
  const mixed = () =>
    managed() &&
    !row &&
    !checked() &&
    table?.enabledKeys().some((key) => table.selected().has(key));
  return (
    <Toggle
      type="checkbox"
      aria-label={row ? "Select row" : "Select all"}
      {...omit(props, "type", "checked", "onChange")}
      checked={checked()}
      prop:indeterminate={Boolean(mixed())}
      disabled={
        props.disabled || row?.disabled() || (managed() && !row && table?.mode() === "single")
      }
      onChange={(event) => {
        call(props.onChange, event);
        if (!managed() || !table) return;
        const node = event.currentTarget;
        if (!event.defaultPrevented) {
          if (row) table.select(row.key()!);
          else table.selectAll(node.checked);
        }
        queueMicrotask(() => {
          node.checked = Boolean(checked());
        });
      }}
    />
  );
}

export function TableExpandButton(props: ButtonProps) {
  const table = useContext(State);
  const row = useContext(RowState);
  return (
    <Button
      isIconOnly
      size="sm"
      variant="borderless"
      aria-label={row?.expanded() ? "Collapse row" : "Expand row"}
      {...omit(props, "onClick", "children")}
      data-lenso-slot="table-expand-button"
      aria-expanded={
        row?.key() !== undefined ? (row?.expanded() ? "true" : "false") : props["aria-expanded"]
      }
      disabled={props.disabled || row?.disabled()}
      onClick={(event, details) => {
        event.stopPropagation();
        const listener = props.onClick;
        const result =
          typeof listener === "function"
            ? listener(event, details)
            : listener?.[0](listener[1], event, details);
        if (!event.defaultPrevented && row?.key() !== undefined && !row.disabled())
          table?.toggleExpanded(row.key()!);
        return result;
      }}
    >
      {props.children ?? (row?.expanded() ? "−" : "+")}
    </Button>
  );
}

export function TableSortableColumnHeader(
  props: ComponentProps<typeof SortLabel> & {
    sortDirection?: SortDescriptor["direction"];
    showIndicator?: boolean;
    indicator?: JSX.Element;
  },
) {
  return (
    <SortLabel {...omit(props, "sortDirection", "showIndicator", "indicator", "children")}>
      {props.children}
      <Show when={props.sortDirection && props.showIndicator !== false}>
        <span
          aria-hidden="true"
          data-direction={props.sortDirection}
          {...attributes(
            s.sortableColumnIndicator,
            props.sortDirection === "descending" && s.descending,
          )}
        >
          {props.indicator ?? (
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
              <path
                d="m4 10 4-4 4 4"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          )}
        </span>
      </Show>
    </SortLabel>
  );
}

export function TableColumnResizer(props: ComponentProps<typeof Resizer>) {
  const column = useContext(ColumnState);
  if (!column) throw new Error("Table.ColumnResizer requires Table.Column");
  let drag: { pointer: number; x: number; width: number; direction: number } | undefined;
  const release = (event: PointerEvent) => {
    if (drag?.pointer === event.pointerId) drag = undefined;
  };

  return (
    <Resizer
      aria-label="Resize column"
      {...props}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Column resizing uses a focusable separator with a value.
      role="separator"
      tabindex={0}
      aria-orientation="vertical"
      aria-valuemin={column.min()}
      aria-valuemax={column.max()}
      aria-valuenow={column.width()}
      onClick={(event) => {
        event.stopPropagation();
        call(props.onClick, event);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        call(props.onKeyDown, event);
        if (event.defaultPrevented) return;
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          column.resize(event.key === "Home" ? column.min() : column.max());
        } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          const grow = event.key === (isRTL(event.currentTarget) ? "ArrowLeft" : "ArrowRight");
          column.resize(column.width() + (grow ? 1 : -1) * (event.shiftKey ? 50 : 10));
        }
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        call(props.onPointerDown, event);
        if (event.defaultPrevented || event.button !== 0 || drag) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag = {
          pointer: event.pointerId,
          x: event.clientX,
          width: column.width(),
          direction: isRTL(event.currentTarget) ? -1 : 1,
        };
      }}
      onPointerMove={(event) => {
        call(props.onPointerMove, event);
        if (drag && drag.pointer === event.pointerId && !event.defaultPrevented)
          column.resize(drag.width + (event.clientX - drag.x) * drag.direction);
      }}
      onPointerUp={(event) => {
        release(event);
        call(props.onPointerUp, event);
      }}
      onPointerCancel={(event) => {
        release(event);
        call(props.onPointerCancel, event);
      }}
      onLostPointerCapture={(event) => {
        release(event);
        call(props.onLostPointerCapture, event);
      }}
    />
  );
}

export function TableLoadMore(
  props: ComponentProps<typeof Sentinel> & {
    colSpan?: number;
    onLoadMore?: () => void;
    loading?: boolean;
    hasMore?: boolean;
  },
) {
  const [node, setNode] = createSignal<HTMLTableRowElement>();
  createEffect(
    () => [node(), props.loading, props.hasMore, props.onLoadMore] as const,
    ([element, loading, hasMore, load]) => {
      if (!element || loading || hasMore === false || !load) return;
      const observer = new IntersectionObserver(([entry]) => {
        if (entry?.isIntersecting) load();
      });
      observer.observe(element);
      return () => observer.disconnect();
    },
  );
  return (
    <Sentinel
      {...omit(props, "colSpan", "onLoadMore", "loading", "hasMore", "ref", "children")}
      ref={[setNode, props.ref]}
      aria-busy={props.loading ? "true" : undefined}
    >
      <td colspan={props.colSpan ?? 1}>{props.children}</td>
    </Sentinel>
  );
}

export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  ScrollContainer: TableScrollContainer,
  ResizableContainer: TableResizableContainer,
  Content: TableContent,
  Header: TableHeader,
  Column: TableColumn,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  Footer: TableFooter,
  SortableColumnHeader: TableSortableColumnHeader,
  SelectionCheckbox: TableSelectionCheckbox,
  ExpandButton: TableExpandButton,
  ColumnResizer: TableColumnResizer,
  LoadMore: TableLoadMore,
  LoadMoreContent: TableLoadMoreContent,
  Collection: TableCollection,
});
