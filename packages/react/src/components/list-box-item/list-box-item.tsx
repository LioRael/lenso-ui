"use client";
// HeroUI v3.2.6 anatomy/styles adaptation, Apache-2.0.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { listBoxItemStyles } from "@lenso/tokens/list-box-item";
import { CollectionContext, type CollectionKey } from "../list-box/list-box.js";
import { type StyleXProps } from "../../utils/styled.js";
import { CollectionElement, type CollectionRender } from "../list-box/element.js";

export interface ListBoxItemRootProps extends StyleXProps<
  Omit<React.ComponentPropsWithRef<"div">, "children">
> {
  itemKey: CollectionKey;
  textValue: string;
  disabled?: boolean;
  variant?: "default" | "danger";
  render?: CollectionRender;
  children?:
    | React.ReactNode
    | ((state: { isSelected: boolean; isDisabled: boolean }) => React.ReactNode);
}
const ItemContext = React.createContext({ selected: false, danger: false });
export function ListBoxItemRoot({
  itemKey,
  textValue,
  disabled = false,
  variant = "default",
  children,
  ref,
  xstyle,
  style,
  onClick,
  onFocus,
  onKeyDown,
  render,
  ...props
}: ListBoxItemRootProps) {
  const model = React.useContext(CollectionContext);
  if (!model) throw new Error("ListBoxItem requires ListBox");
  const node = React.useRef<HTMLDivElement>(null);
  const register = model.register;
  const isDisabled = disabled || !!model.disabledKeys?.has(itemKey);
  React.useLayoutEffect(() => {
    if (node.current)
      return register({ key: itemKey, textValue, disabled: isDisabled, node: node.current });
  }, [itemKey, textValue, isDisabled, register]);
  const selected = model.selected.has(itemKey);
  const itemValue = React.useMemo(
    () => ({ selected, danger: variant === "danger" }),
    [selected, variant],
  );
  const compiled = stylex.props(
    listBoxItemStyles.root,
    variant === "danger" && listBoxItemStyles.danger,
    isDisabled && listBoxItemStyles.disabled,
    xstyle,
  );
  // oxlint-disable jsx-a11y/prefer-tag-over-role -- Native option belongs to select; this custom listbox option contains arbitrary labels and selection indicators.
  return (
    <ItemContext.Provider value={itemValue}>
      <CollectionElement
        render={render}
        {...props}
        {...compiled}
        ref={(value) => {
          node.current = value;
          if (typeof ref === "function") return ref(value);
          if (ref) ref.current = value;
        }}
        style={{ ...compiled.style, ...style }}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "list-box-item"}
        role="option"
        aria-setsize={props["aria-setsize"] ?? model.collectionSize}
        aria-posinset={props["aria-posinset"] ?? model.itemPosition(itemKey)}
        draggable={!isDisabled && (props.draggable ?? model.drag.enabled)}
        onDragStart={(event) => {
          props.onDragStart?.(event);
          if (!event.defaultPrevented) model.drag.start(event, itemKey);
        }}
        onDragOver={(event) => {
          props.onDragOver?.(event);
          if (!event.defaultPrevented) model.drag.over(event, itemKey);
        }}
        onDrop={(event) => {
          props.onDrop?.(event);
          if (!event.defaultPrevented) model.drag.drop(event, itemKey);
        }}
        onDragEnd={(event) => {
          props.onDragEnd?.(event);
          model.drag.end();
        }}
        aria-selected={selected}
        aria-disabled={isDisabled || undefined}
        tabIndex={!isDisabled && model.active === itemKey ? 0 : -1}
        onFocus={(event) => {
          onFocus?.(event);
          if (!isDisabled && model.active !== itemKey) model.focus(itemKey);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (
            !event.defaultPrevented &&
            !isDisabled &&
            !(event.target as HTMLElement).closest("button,input,a")
          ) {
            model.focus(itemKey);
            model.select(itemKey, event.shiftKey);
            model.onAction?.(itemKey);
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && !isDisabled) {
            const action =
              !model.drag.dragging &&
              !(event.target as HTMLElement).closest('[slot="drag"]') &&
              (event.key === "Enter" || event.key === " ");
            model.keyDown(event, itemKey);
            if (action) model.onAction?.(itemKey);
          }
        }}
      >
        {typeof children === "function" ? children({ isSelected: selected, isDisabled }) : children}
      </CollectionElement>
    </ItemContext.Provider>
  );
  // oxlint-enable jsx-a11y/prefer-tag-over-role
}
export function ListBoxItemIndicator({
  children,
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<"span">, "children">> & {
  children?: React.ReactNode | ((state: { isSelected: boolean }) => React.ReactNode);
}) {
  const { selected, danger } = React.useContext(ItemContext);
  const compiled = stylex.props(
    listBoxItemStyles.indicator,
    danger && listBoxItemStyles.indicatorDanger,
    xstyle,
  );
  return (
    <span
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "list-box-item-indicator"}
      data-collection-indicator=""
      data-visible={selected || undefined}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      aria-hidden="true"
    >
      {typeof children === "function"
        ? children({ isSelected: selected })
        : (children ?? (
            <svg
              {...stylex.props(listBoxItemStyles.checkmark)}
              aria-hidden="true"
              data-slot="list-box-item-indicator--checkmark"
              fill="none"
              stroke="currentColor"
              strokeDasharray={22}
              strokeDashoffset={selected ? 44 : 66}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              viewBox="0 0 17 18"
            >
              <polyline points="1 9 7 14 15 4" />
            </svg>
          ))}
    </span>
  );
}
export const ListBoxItem = Object.assign(ListBoxItemRoot, {
  Root: ListBoxItemRoot,
  Indicator: ListBoxItemIndicator,
});
