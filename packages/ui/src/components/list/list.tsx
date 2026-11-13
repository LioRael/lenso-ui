"use client";
import {
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  type ComponentProps,
  type Key,
  type ReactNode,
} from "react";
import { usePart } from "@ui-sdk/react/primitive";
import { NativeButton as SdkButton } from "../../utils/native-button.js";
import { assignRef } from "../../utils/interaction/ref.js";
import { Checkbox } from "../checkbox/index.js";
import { SwipeActions, type SwipeAction } from "../swipe-actions/index.js";
import {
  ListContext,
  ListRowContext,
  ListSectionContext,
  useListContext,
  useListEditing,
  type ListEditingProps,
} from "./list-state.js";
import { listStyles } from "@lenso/tokens/list";
import { groupStyles } from "@lenso/tokens/surface";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type ListRootProps = StyleXProps<ComponentProps<"ul">> &
  ListEditingProps & { variant?: "grouped" | "plain" };
export function ListRoot({
  editing,
  disabled,
  value,
  defaultValue,
  onValueChange,
  onReorder,
  controller,
  variant = "grouped",
  onKeyDown,
  onClickCapture,
  xstyle,
  style,
  ...props
}: ListRootProps) {
  const model = useListEditing({
    editing,
    disabled,
    value,
    defaultValue,
    onValueChange,
    onReorder,
    controller,
  });
  const compiled = stylex.props(
    variant === "grouped" && groupStyles.surface,
    listStyles.root,
    variant === "grouped" && listStyles.surface,
    xstyle,
  );
  const element = usePart(
    model.handle,
    "root",
    {},
    {
      ...props,
      ...compiled,
      style: { ...compiled.style, ...style },
      "aria-label": props["aria-label"] ?? "List",
      ...{ "data-lenso-slot": "list-root" },
      onClickCapture: (event) => {
        onClickCapture?.(event);
        if (
          !event.defaultPrevented &&
          model.dismissOtherRow(event.target as Node) &&
          event.detail > 0
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      onKeyDown: (event) => {
        onKeyDown?.(event);
        if (
          !event.defaultPrevented &&
          model.editing &&
          !model.disabled &&
          (event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === "a" &&
          !(event.target as Element).closest(
            'input:not([type="checkbox"]),textarea,select,[contenteditable]',
          )
        ) {
          event.preventDefault();
          model.selectAll(event.nativeEvent);
        }
      },
    },
    "ul",
  );
  return (
    <ListContext value={model}>
      {element}
      {model.editing && model.canReorder && (
        <span id={model.instructionsId} {...stylex.props(listStyles.srOnly)}>
          Press Space or Enter to move. Use Up or Down, Enter to place, Escape to cancel.
        </span>
      )}
    </ListContext>
  );
}

export type ListContentProps = StyleXProps<ComponentProps<"div">>;
export function ListContent({ xstyle, style, ...props }: ListContentProps) {
  const compiled = stylex.props(listStyles.content, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="list-content"
    />
  );
}
export type ListTitleProps = StyleXProps<ComponentProps<"span">>;
export function ListTitle({ xstyle, style, ...props }: ListTitleProps) {
  const compiled = stylex.props(listStyles.title, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="list-title"
    />
  );
}
export type ListDescriptionProps = StyleXProps<ComponentProps<"span">>;
export function ListDescription({ xstyle, style, ...props }: ListDescriptionProps) {
  const compiled = stylex.props(listStyles.description, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="list-description"
    />
  );
}
export type ListLeadingProps = StyleXProps<ComponentProps<"span">>;
export function ListLeading({ xstyle, style, ...props }: ListLeadingProps) {
  const compiled = stylex.props(listStyles.leading, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="list-leading"
    />
  );
}
export type ListTrailingProps = StyleXProps<ComponentProps<"span">>;
export function ListTrailing({ xstyle, style, ...props }: ListTrailingProps) {
  const compiled = stylex.props(listStyles.trailing, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="list-trailing"
    />
  );
}
export type ListSeparatorProps = StyleXProps<ComponentProps<"li">>;
export function ListSeparator({ xstyle, style, ...props }: ListSeparatorProps) {
  const compiled = stylex.props(groupStyles.separator, listStyles.separator, xstyle);
  return (
    <li
      role="presentation"
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="list-separator"
    />
  );
}
export type ListActionProps = StyleXProps<ComponentProps<typeof SdkButton>>;
export function ListAction({ xstyle, style, ...props }: ListActionProps) {
  const row = useContext(ListRowContext);
  const compiled = stylex.props(listStyles.action, row.editing && listStyles.editingAction, xstyle);
  return (
    <SdkButton
      type="button"
      {...props}
      disabled={props.disabled || row.disabled || row.editing}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot="list-action"
    />
  );
}
export type ListItemProps = Omit<StyleXProps<ComponentProps<"li">>, "children"> & {
  height?: "regular" | "tall";
  itemKey?: Key;
  textValue?: string;
  disabled?: boolean;
  selectionLabel?: string;
  reorderLabel?: string;
  startActions?: readonly SwipeAction[];
  endActions?: readonly SwipeAction[];
  startActionsLabel?: string;
  endActionsLabel?: string;
  children?: ReactNode | ((state: { editing: boolean; isSelected: boolean }) => ReactNode);
};
export function ListItem({
  height = "regular",
  itemKey,
  textValue,
  disabled = false,
  selectionLabel,
  reorderLabel,
  startActions,
  endActions,
  startActionsLabel,
  endActionsLabel,
  children,
  ref,
  onClickCapture,
  xstyle,
  style,
  ...props
}: ListItemProps) {
  const model = useListContext();
  const group = useContext(ListSectionContext);
  const node = useRef<HTMLLIElement>(null);
  const mergedRef = useCallback(
    (element: HTMLLIElement | null) => {
      const ownCleanup = assignRef(node, element);
      const callerCleanup = assignRef(ref, element);
      return () => {
        ownCleanup();
        callerCleanup();
      };
    },
    [ref],
  );
  const register = model?.register;
  const text = textValue ?? String(itemKey ?? "item");
  const inactive = disabled || !!model?.disabled;
  const editing = !!model?.editing && itemKey !== undefined;
  const selected = itemKey !== undefined && !!model?.isSelected(itemKey);
  const managed = itemKey !== undefined || !!startActions?.length || !!endActions?.length;
  useLayoutEffect(() => {
    if (register && itemKey !== undefined && node.current)
      return register({ key: itemKey, text, node: node.current, disabled: inactive, group });
  }, [register, itemKey, text, inactive, group]);
  const content =
    typeof children === "function" ? children({ editing, isSelected: selected }) : children;
  const dragging = itemKey !== undefined && model?.drag?.key === itemKey;
  const dropPosition =
    itemKey !== undefined && model?.drag?.target?.key === itemKey
      ? model.drag.target.position
      : null;
  const compiled = stylex.props(
    !managed && groupStyles.row,
    managed ? listStyles.container : listStyles.item,
    listStyles.boundary,
    height === "tall" && listStyles.tall,
    dragging && listStyles.dragged,
    dropPosition === "before" && listStyles.dropBefore,
    dropPosition === "after" && listStyles.dropAfter,
    xstyle,
  );
  const row = (
    <div
      data-lenso-slot="list-row"
      {...stylex.props(groupStyles.row, listStyles.item, height === "tall" && listStyles.tall)}
    >
      {editing && (
        // oxlint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- Only stop a native checkbox's handled click from activating the row.
        <span
          data-list-selection=""
          {...stylex.props(listStyles.selection)}
          onClick={(event) => event.stopPropagation()}
        >
          <Checkbox
            disabled={inactive}
            checked={selected}
            aria-label={selectionLabel ?? `Select ${text}`}
            onCheckedChange={(checked, details) =>
              model!.setChecked(itemKey!, checked === true, {
                reason: "item-press",
                ...(details.event ? { event: details.event } : {}),
              })
            }
          >
            <Checkbox.Content>
              <Checkbox.Control xstyle={listStyles.selectionControl}>
                <Checkbox.Indicator />
              </Checkbox.Control>
            </Checkbox.Content>
          </Checkbox>
        </span>
      )}
      <div data-lenso-slot="list-body" {...stylex.props(listStyles.body)}>
        {content}
      </div>
      {editing && model?.canReorder && (
        <button
          type="button"
          data-list-reorder=""
          disabled={inactive}
          aria-label={reorderLabel ?? `Move ${text}`}
          aria-describedby={model.instructionsId}
          aria-pressed={model.drag?.key === itemKey}
          {...stylex.props(listStyles.handle)}
          onPointerDown={(event) => model.pointerDown(itemKey!, event.nativeEvent)}
          onKeyDown={(event) => model.keyDown(itemKey!, event.currentTarget, event)}
          onBlur={() => model.blurHandle(itemKey!)}
          onClick={(event) => {
            event.stopPropagation();
            if (event.detail === 0) model.activateHandle(itemKey!, event.currentTarget);
          }}
        >
          <span aria-hidden="true">≡</span>
        </button>
      )}
    </div>
  );
  const swiping = !!startActions?.length || !!endActions?.length;
  return (
    <ListRowContext value={{ editing, disabled: inactive }}>
      <li
        {...props}
        {...compiled}
        ref={mergedRef}
        style={{ ...compiled.style, ...style }}
        data-lenso-slot="list-item"
        data-list-key={itemKey === undefined ? undefined : String(itemKey)}
        data-selected={selected ? "" : undefined}
        onClickCapture={(event) => {
          onClickCapture?.(event);
          if (event.defaultPrevented) return;
          if (inactive) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (
            editing &&
            !(event.target as Element).closest(
              "[data-list-selection],[data-list-reorder],button,a,input,textarea,select,[contenteditable]",
            )
          ) {
            event.preventDefault();
            event.stopPropagation();
            node.current
              ?.querySelector<HTMLElement>('[data-list-selection] [role="checkbox"]')
              ?.click();
          }
        }}
      >
        {swiping ? (
          <SwipeActions
            startActionsLabel={startActionsLabel ?? `Leading actions for ${text}`}
            endActionsLabel={endActionsLabel ?? `Actions for ${text}`}
            startActions={editing ? [] : startActions}
            endActions={editing ? [] : endActions}
            disabled={inactive || editing}
            {...(model && itemKey !== undefined
              ? {
                  openSide: model.open?.key === itemKey ? model.open.side : null,
                  onOpenSideChange: (side, details) => {
                    if (
                      !side &&
                      details.reason === "outside-press" &&
                      details.event?.target instanceof Node &&
                      model.isOtherRow(details.event.target)
                    )
                      details.cancel();
                    else model.setOpen(side ? { key: itemKey, side } : null);
                  },
                }
              : {})}
          >
            {row}
          </SwipeActions>
        ) : managed ? (
          row
        ) : (
          content
        )}
      </li>
    </ListRowContext>
  );
}
export type ListSectionProps = Omit<StyleXProps<ComponentProps<"li">>, "title"> & {
  title: ReactNode;
};
export function ListSection({ title, id, children, xstyle, style, ...props }: ListSectionProps) {
  const generated = useId();
  const heading = id ?? generated;
  const compiled = stylex.props(listStyles.section, xstyle);
  return (
    <li {...props} {...compiled} style={{ ...compiled.style, ...style }}>
      <h2 id={heading} {...stylex.props(listStyles.sectionHeading)}>
        {title}
      </h2>
      <ListSectionContext value={heading}>
        <ul
          aria-labelledby={heading}
          {...stylex.props(groupStyles.surface, listStyles.root, listStyles.surface)}
        >
          {children}
        </ul>
      </ListSectionContext>
    </li>
  );
}
export const List = Object.assign(ListRoot, {
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
export type ListProps = ListRootProps;
export type { ListReorderDetails } from "./list-state.js";
