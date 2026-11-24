import { list, listKey, type ListKey, type ListOptions } from "@lenso/primitives/list/core";
import { listStyles as s } from "@lenso/tokens/list";
import { groupStyles } from "@lenso/tokens/surface";
import type { JSX } from "@solidjs/web";
import * as stylex from "@stylexjs/stylex";
import { Button } from "@ui-sdk/solid/button";
import {
  usePart,
  usePrimitive,
  type PartProps,
  type PrimitiveHandle,
} from "@ui-sdk/solid/primitive";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  merge,
  omit,
  Show,
  useContext,
  type ComponentProps,
} from "solid-js";
import { Checkbox } from "./checkbox.jsx";
import { htmlPart, sdkPart, type SlotProps, type StyledPart } from "./parts.js";
import { styled } from "./styled.js";
import { SwipeActions, type SwipeAction } from "./swipe-actions.jsx";

type State = ReturnType<typeof list>["types"]["state"];
const ListContext = createContext<{
  handle: PrimitiveHandle<typeof list>;
  state: () => State;
} | null>(null);
const SectionContext = createContext<string | null>(null);
export type ListRootProps = PartProps<"ul", State> &
  SlotProps &
  ListOptions & { variant?: "grouped" | "plain" };

export function ListRoot(props: ListRootProps) {
  const handle = usePrimitive(list, () => ({
    editing: props.editing,
    disabled: props.disabled,
    value: props.value,
    defaultValue: props.defaultValue,
    onValueChange: props.onValueChange,
    onReorder: props.onReorder,
    controller: props.controller,
  }));
  const [state, setState] = createSignal(handle.instance.get());
  createEffect(
    () => handle,
    (current) => {
      setState(current.instance.get());
      return current.instance.subscribe(() => setState(current.instance.get()));
    },
  );
  const compiled = createMemo(() =>
    stylex.props(
      props.variant !== "plain" && groupStyles.surface,
      s.root,
      props.variant !== "plain" && s.surface,
      props.xstyle,
    ),
  );
  const rest = omit(
    props,
    "class",
    "style",
    "xstyle",
    "variant",
    "children",
    "editing",
    "disabled",
    "value",
    "defaultValue",
    "onValueChange",
    "onReorder",
    "controller",
  );
  return (
    <ListContext value={{ handle, state }}>
      {usePart(
        handle,
        "root",
        () => ({}),
        merge(
          { "aria-label": "List", "data-lenso-slot": "list-root" },
          rest,
          styled<State>(compiled, props),
          {
            get children() {
              return props.children;
            },
          },
        ),
        "ul",
      )}
    </ListContext>
  );
}

const Item = htmlPart("li", "list-item", () => [s.container, s.boundary]);
const Row = htmlPart("div", "list-row", () => [groupStyles.row, s.item]);
const Selection = htmlPart("span", "list-selection", () => s.selection);
const Reorder: StyledPart<typeof Button> = sdkPart(Button, "list-reorder", () => s.handle);
export type ListItemProps = Omit<ComponentProps<typeof Item>, "children"> & {
  itemKey?: ListKey;
  textValue?: string;
  height?: "regular" | "tall";
  disabled?: boolean;
  selectionLabel?: string;
  reorderLabel?: string;
  startActions?: readonly SwipeAction[];
  endActions?: readonly SwipeAction[];
  children?: JSX.Element | ((state: { editing: boolean; isSelected: boolean }) => JSX.Element);
};

export function ListItem(props: ListItemProps) {
  const model = useContext(ListContext);
  const group = useContext(SectionContext);
  const [node, setNode] = createSignal<HTMLLIElement>();
  const disabled = () => props.disabled || model?.state().disabled || false;
  const id = () => props.itemKey;
  const editing = () => id() !== undefined && Boolean(model?.state().editing);
  const key = () => (id() === undefined ? undefined : listKey(id()!));
  const selected = () => key() !== undefined && Boolean(model?.state().value.includes(key()!));
  const label = () => props.textValue ?? String(id() ?? "item");
  const draft = () => model?.state().reordering;
  const dropPosition = () => {
    const active = draft();
    if (!active || !model || !key()) return undefined;
    const from = model.state().order.indexOf(active.key);
    const to = active.order.indexOf(active.key);
    if (from === to || from < 0 || to < 0) return undefined;
    return active.order[to + (to < from ? 1 : -1)] === key()
      ? to < from
        ? "before"
        : "after"
      : undefined;
  };
  createEffect(
    () => [node(), id(), props.textValue, props.disabled] as const,
    ([element, itemKey, text, inactive]) => {
      if (model && element && itemKey !== undefined)
        return model.handle.api.register({
          key: itemKey,
          text: text ?? String(itemKey),
          node: element,
          disabled: Boolean(inactive),
          group: group ?? undefined,
        });
    },
  );

  function renderChildren() {
    const children = props.children;
    return typeof children === "function"
      ? children({ editing: editing(), isSelected: selected() })
      : children;
  }

  function Content() {
    return (
      <Row xstyle={props.height === "tall" && s.tall}>
        <Show when={editing()}>
          <Selection data-list-selection="">
            <Checkbox
              aria-label={props.selectionLabel ?? `Select ${label()}`}
              checked={selected()}
              disabled={disabled()}
              onCheckedChange={(checked, details) =>
                model?.handle.api.setChecked(id()!, checked === true, { event: details.event })
              }
            >
              <Checkbox.Control xstyle={s.selectionControl}>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox>
          </Selection>
        </Show>
        {renderChildren()}
        <Show when={editing()}>
          <Reorder
            aria-label={props.reorderLabel ?? `Reorder ${label()}`}
            disabled={disabled()}
            data-list-reorder=""
            onPointerDown={(event) => model?.handle.api.pointerdown(event, id()!)}
            onKeyDown={(event) => {
              model?.handle.api.keydown(event, id()!);
            }}
            onClick={(event) => {
              if (!event.defaultPrevented) model?.handle.api.activate(id()!);
            }}
          >
            <span aria-hidden="true">≡</span>
          </Reorder>
        </Show>
      </Row>
    );
  }

  const rest = omit(
    props,
    "ref",
    "xstyle",
    "itemKey",
    "textValue",
    "height",
    "disabled",
    "selectionLabel",
    "reorderLabel",
    "startActions",
    "endActions",
  );
  return (
    <Item
      {...rest}
      ref={[setNode, props.ref]}
      xstyle={[
        key() !== undefined && draft()?.key === key() && s.dragged,
        dropPosition() === "before" && s.dropBefore,
        dropPosition() === "after" && s.dropAfter,
        props.xstyle,
      ]}
    >
      <Show
        when={!editing() && (props.startActions?.length || props.endActions?.length)}
        fallback={<Content />}
      >
        <SwipeActions
          startActions={props.startActions}
          endActions={props.endActions}
          disabled={disabled()}
        >
          <Content />
        </SwipeActions>
      </Show>
    </Item>
  );
}

export const ListContent = htmlPart("div", "list-content", () => s.content);
export const ListTitle = htmlPart("span", "list-title", () => s.title);
export const ListDescription = htmlPart("span", "list-description", () => s.description);
export const ListLeading = htmlPart("span", "list-leading", () => s.leading);
export const ListTrailing = htmlPart("span", "list-trailing", () => s.trailing);
export const ListSeparator = htmlPart("li", "list-separator", () => s.separator);
export const ListAction: StyledPart<typeof Button> = sdkPart(Button, "list-action", () => s.action);
const Section = htmlPart("li", "list-section", () => s.section);
const SectionHeading = htmlPart("div", "list-section-heading", () => s.sectionHeading);

export function ListSection(props: ComponentProps<typeof Section>) {
  return (
    <SectionContext value={props.id || props.title || null}>
      <Section {...omit(props, "title", "children")}>
        {props.title && <SectionHeading>{props.title}</SectionHeading>}
        <ul>{props.children}</ul>
      </Section>
    </SectionContext>
  );
}

export const List: typeof ListRoot & {
  Root: typeof ListRoot;
  Item: typeof ListItem;
  Content: typeof ListContent;
  Title: typeof ListTitle;
  Description: typeof ListDescription;
  Leading: typeof ListLeading;
  Trailing: typeof ListTrailing;
  Separator: typeof ListSeparator;
  Action: typeof ListAction;
  Section: typeof ListSection;
} = Object.assign(ListRoot, {
  Root: ListRoot,
  Item: ListItem,
  Content: ListContent,
  Title: ListTitle,
  Description: ListDescription,
  Leading: ListLeading,
  Trailing: ListTrailing,
  Separator: ListSeparator,
  Action: ListAction,
  Section: ListSection,
});
export { createListController } from "@lenso/primitives/list/core";
