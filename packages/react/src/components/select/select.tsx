"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI selection/collection API and scoped portals.
 */
import { Select as BaseSelect } from "@base-ui/react/select";
import { selectStyles } from "@lenso/tokens/select";
import { createContext, useContext, useMemo, type ComponentPropsWithRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

const SelectStyleContext = createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
});
export function SelectRoot<Value, Multiple extends boolean | undefined = false>({
  variant = "primary",
  fullWidth = false,
  ...props
}: SelectRootProps<Value, Multiple>) {
  const appearance = useMemo(() => ({ variant, fullWidth }), [variant, fullWidth]);
  return (
    <SelectStyleContext value={appearance}>
      <BaseSelect.Root {...props} />
    </SelectStyleContext>
  );
}
export type SelectTriggerProps = StyleXProps<BaseSelect.Trigger.Props> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-slot"?: unknown;
};
export function SelectTrigger({
  variant,
  fullWidth,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SelectTriggerProps) {
  const inherited = useContext(SelectStyleContext);
  const compiled = stylex.props(
    selectStyles.trigger,
    (variant ?? inherited.variant) === "secondary" && selectStyles.secondary,
    (fullWidth ?? inherited.fullWidth) && selectStyles.fullWidth,
    xstyle,
  );
  return (
    <BaseSelect.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Trigger.State>(compiled.style, style)}
      data-slot={slot ?? "select-trigger"}
    />
  );
}
export function SelectValue({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Value.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.value, xstyle);
  return (
    <BaseSelect.Value
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Value.State>(compiled.style, style)}
      data-slot={slot ?? "select-value"}
    />
  );
}
export type SelectIndicatorProps = StyleXProps<BaseSelect.Icon.Props> & { "data-slot"?: unknown };
export function SelectIndicator({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SelectIndicatorProps) {
  const compiled = stylex.props(selectStyles.indicator, xstyle);
  return (
    <BaseSelect.Icon
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Icon.State>(compiled.style, style)}
      data-slot={slot ?? "select-indicator"}
    >
      {children ?? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </BaseSelect.Icon>
  );
}
export type SelectPortalProps = ComponentPropsWithRef<typeof BaseSelect.Portal>;
export function SelectPortal({ container, ...props }: SelectPortalProps) {
  const themeContainer = useThemePortalContainer();
  return (
    <BaseSelect.Portal
      {...props}
      container={container === undefined ? (themeContainer ?? undefined) : container}
    />
  );
}
export function SelectPositioner({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Positioner.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.positioner, xstyle);
  return (
    <BaseSelect.Positioner
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Positioner.State>(compiled.style, style)}
      data-slot={slot ?? "select-positioner"}
    />
  );
}
export function SelectPopover({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Popup.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.popover, xstyle);
  return (
    <BaseSelect.Popup
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Popup.State>(compiled.style, style)}
      data-slot={slot ?? "select-popover"}
    />
  );
}
export function SelectList({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.List.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.list, xstyle);
  return (
    <BaseSelect.List
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.List.State>(compiled.style, style)}
      data-slot={slot ?? "select-list"}
    />
  );
}
export function SelectItem({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<Omit<BaseSelect.Item.Props, "ref"> & React.RefAttributes<HTMLElement>> & {
  "data-slot"?: unknown;
}) {
  const compiled = stylex.props(selectStyles.item, xstyle);
  return (
    <BaseSelect.Item
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Item.State>(compiled.style, style)}
      data-slot={slot ?? "select-item"}
    />
  );
}
export function SelectItemText({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.ItemText.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.itemText, xstyle);
  return (
    <BaseSelect.ItemText
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.ItemText.State>(compiled.style, style)}
      data-slot={slot ?? "select-item-text"}
    />
  );
}
export type SelectItemIndicatorProps = StyleXProps<BaseSelect.ItemIndicator.Props> & {
  "data-slot"?: unknown;
};
export function SelectItemIndicator({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: SelectItemIndicatorProps) {
  const compiled = stylex.props(selectStyles.itemIndicator, xstyle);
  return (
    <BaseSelect.ItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.ItemIndicator.State>(compiled.style, style)}
      data-slot={slot ?? "select-item-indicator"}
    >
      {children ?? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="m2 6 2.5 2.5L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </BaseSelect.ItemIndicator>
  );
}
export function SelectLabel({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Label.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.label, xstyle);
  return (
    <BaseSelect.Label
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Label.State>(compiled.style, style)}
      data-slot={slot ?? "select-label"}
    />
  );
}
export function SelectGroup({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Group.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(xstyle);
  return (
    <BaseSelect.Group
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Group.State>(compiled.style, style)}
      data-slot={slot ?? "select-group"}
    />
  );
}
export function SelectGroupLabel({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.GroupLabel.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.groupLabel, xstyle);
  return (
    <BaseSelect.GroupLabel
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.GroupLabel.State>(compiled.style, style)}
      data-slot={slot ?? "select-group-label"}
    />
  );
}
export function SelectSeparator({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Separator.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.separator, xstyle);
  return (
    <BaseSelect.Separator
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Separator.State>(compiled.style, style)}
      data-slot={slot ?? "select-separator"}
    />
  );
}
export function SelectArrow({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseSelect.Arrow.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.arrow, xstyle);
  return (
    <BaseSelect.Arrow
      {...props}
      {...compiled}
      style={mergeStyle<BaseSelect.Arrow.State>(compiled.style, style)}
      data-slot={slot ?? "select-arrow"}
    />
  );
}
export const SelectScrollUpArrow = BaseSelect.ScrollUpArrow;
export const SelectScrollDownArrow = BaseSelect.ScrollDownArrow;
export const SelectBackdrop = BaseSelect.Backdrop;
export type SelectRootProps<
  Value = unknown,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export type SelectValueProps = ComponentPropsWithRef<typeof SelectValue>;
export type SelectPopoverProps = ComponentPropsWithRef<typeof SelectPopover>;
export type SelectPositionerProps = ComponentPropsWithRef<typeof SelectPositioner>;
export type SelectListProps = ComponentPropsWithRef<typeof SelectList>;
export type SelectItemProps = ComponentPropsWithRef<typeof SelectItem>;
