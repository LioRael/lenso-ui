"use client";
// HeroUI v3.2.6 anatomy/styles adaptation, Apache-2.0.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { tagStyles } from "@lenso/tokens/tag";
import { type StyleXProps } from "../../utils/styled.js";
import { CollectionContext, type CollectionKey } from "../list-box/list-box.js";
import { TagGroupContext } from "../tag-group/tag-group.js";

export interface TagRootProps extends StyleXProps<
  Omit<React.ComponentPropsWithRef<"div">, "children">
> {
  itemKey: CollectionKey;
  textValue: string;
  disabled?: boolean;
  children?:
    | React.ReactNode
    | ((state: {
        allowsRemoving: boolean;
        isSelected: boolean;
        isDisabled: boolean;
      }) => React.ReactNode);
}
const TagContext = React.createContext<{
  remove?: () => void;
  disabled: boolean;
  textValue: string;
}>({ disabled: false, textValue: "" });
function resolveTagContent(
  children: TagRootProps["children"],
  state: { allowsRemoving: boolean; isSelected: boolean; isDisabled: boolean },
) {
  const content = typeof children === "function" ? children(state) : children;
  const hasRemove =
    typeof children === "function" ||
    React.Children.toArray(content).some(
      (child) => React.isValidElement(child) && child.type === TagRemoveButton,
    );
  return { content, hasRemove };
}
export function TagRoot({
  itemKey,
  textValue,
  disabled = false,
  children,
  ref,
  xstyle,
  style,
  onClick,
  onFocus,
  onKeyDown,
  ...props
}: TagRootProps) {
  const model = React.useContext(CollectionContext);
  const group = React.useContext(TagGroupContext);
  const node = React.useRef<HTMLDivElement>(null);
  const register = model?.register;
  const isDisabled = disabled || group.disabled || !!model?.disabledKeys?.has(itemKey);
  const hidden = group.removed.has(itemKey);
  React.useLayoutEffect(() => {
    if (!hidden && node.current)
      return register?.({ key: itemKey, node: node.current, textValue, disabled: isDisabled });
  }, [itemKey, textValue, isDisabled, hidden, register]);
  const tagValue = React.useMemo(
    () => ({
      remove: group.removable ? () => model?.remove?.(itemKey) : undefined,
      disabled: isDisabled,
      textValue,
    }),
    [group.removable, model, itemKey, isDisabled, textValue],
  );
  if (hidden) return null;
  const selected = !!model?.selected.has(itemKey);
  const compiled = stylex.props(
    tagStyles.root,
    tagStyles[group.size],
    tagStyles[group.variant],
    selected && tagStyles.selected,
    isDisabled && tagStyles.disabled,
    xstyle,
  );
  const { content, hasRemove } = resolveTagContent(children, {
    allowsRemoving: group.removable,
    isSelected: selected,
    isDisabled,
  });
  // oxlint-disable jsx-a11y/prefer-tag-over-role -- Tags are flex-wrapping rows in an interactive ARIA grid, not tabular data; tr/td would require an unrelated native table hierarchy.
  return (
    <TagContext.Provider value={tagValue}>
      <div
        {...props}
        {...compiled}
        ref={(value) => {
          node.current = value;
          if (typeof ref === "function") return ref(value);
          if (ref) ref.current = value;
        }}
        style={{ ...compiled.style, ...style }}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "tag"}
        data-collection-item="tag"
        role="row"
        aria-selected={model?.mode === "none" ? undefined : selected}
        aria-disabled={isDisabled || undefined}
        tabIndex={!isDisabled && (!model || model.active === itemKey) ? 0 : -1}
        data-selected={selected || undefined}
        onFocus={(event) => {
          onFocus?.(event);
          if (
            event.target === event.currentTarget &&
            !isDisabled &&
            model &&
            model.active !== itemKey
          )
            model.focus(itemKey);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !isDisabled) {
            model?.focus(itemKey);
            model?.select(itemKey, event.shiftKey);
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            !isDisabled &&
            !(event.target as HTMLElement).closest("button,input,a,textarea,select")
          )
            model?.keyDown(event, itemKey);
        }}
      >
        <span role="gridcell" {...stylex.props(tagStyles.cell)}>
          {content}
        </span>
        {group.removable && !hasRemove ? (
          <span role="gridcell">
            <TagRemoveButton />
          </span>
        ) : null}
      </div>
    </TagContext.Provider>
  );
  // oxlint-enable jsx-a11y/prefer-tag-over-role
}
export function TagRemoveButton({
  children,
  xstyle,
  style,
  onClick,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"button">>) {
  const tag = React.useContext(TagContext);
  const compiled = stylex.props(tagStyles.removeButton, xstyle);
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={`Remove ${tag.textValue}`}
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "tag-remove-button"}
      disabled={tag.disabled || props.disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
        if (!event.defaultPrevented) tag.remove?.();
      }}
    >
      {children ?? (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="m3 3 6 6m0-6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      )}
    </button>
  );
}
export const Tag = Object.assign(TagRoot, { Root: TagRoot, RemoveButton: TagRemoveButton });
