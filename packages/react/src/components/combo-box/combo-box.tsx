"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI native combobox, including multiple selection and chips.
 */
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { comboBoxStyles, comboBoxSharedStyles } from "@lenso/tokens/combo-box";
import { createContext, useContext, useMemo, useState, type ComponentPropsWithRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

const AppearanceContext = createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
  keyboardHighlight: false,
});
const InputGroupContext = createContext(false);
export function ComboBoxRoot<Value, Multiple extends boolean | undefined = false>({
  variant = "primary",
  fullWidth = false,
  onItemHighlighted,
  onOpenChange,
  ...props
}: ComboBoxRootProps<Value, Multiple>) {
  const [keyboardHighlight, setKeyboardHighlight] = useState(false);
  const appearance = useMemo(
    () => ({ variant, fullWidth, keyboardHighlight }),
    [variant, fullWidth, keyboardHighlight],
  );
  return (
    <AppearanceContext value={appearance}>
      <InputGroupContext value={false}>
        <BaseCombobox.Root
          {...props}
          onItemHighlighted={(value, details) => {
            setKeyboardHighlight(details.reason === "keyboard");
            onItemHighlighted?.(value, details);
          }}
          onOpenChange={(open, details) => {
            onOpenChange?.(open, details);
            if (!open && !details.isCanceled) setKeyboardHighlight(false);
          }}
        />
      </InputGroupContext>
    </AppearanceContext>
  );
}
export type ComboBoxInputGroupProps = StyleXProps<BaseCombobox.InputGroup.Props> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-slot"?: unknown;
};
export function ComboBoxInputGroup({
  variant,
  fullWidth,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: ComboBoxInputGroupProps) {
  const inherited = useContext(AppearanceContext);
  const compiled = stylex.props(
    comboBoxStyles.inputGroup,
    comboBoxStyles.field,
    (variant ?? inherited.variant) === "secondary" && comboBoxStyles.secondary,
    (fullWidth ?? inherited.fullWidth) && comboBoxSharedStyles.fullWidth,
    xstyle,
  );
  return (
    <InputGroupContext value={true}>
      <BaseCombobox.InputGroup
        {...props}
        {...compiled}
        style={mergeStyle<BaseCombobox.InputGroup.State>(compiled.style, style)}
        data-slot={slot ?? "combo-box-input-group"}
      />
    </InputGroupContext>
  );
}
export function ComboBoxInput({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Input.Props> & { "data-slot"?: unknown }) {
  const grouped = useContext(InputGroupContext);
  const appearance = useContext(AppearanceContext);
  const compiled = stylex.props(
    comboBoxStyles.input,
    grouped ? comboBoxStyles.groupedInput : comboBoxStyles.field,
    !grouped && appearance.variant === "secondary" && comboBoxStyles.secondary,
    xstyle,
  );
  return (
    <BaseCombobox.Input
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Input.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-input"}
    />
  );
}
export const ComboBoxValue = BaseCombobox.Value;
export function ComboBoxTrigger({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Trigger.Props> & { "data-slot"?: unknown }) {
  const grouped = useContext(InputGroupContext);
  const compiled = stylex.props(
    comboBoxStyles.trigger,
    !grouped && comboBoxStyles.standaloneTrigger,
    xstyle,
  );
  return (
    <BaseCombobox.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Trigger.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-trigger"}
    />
  );
}
export type ComboBoxIndicatorProps = StyleXProps<BaseCombobox.Icon.Props> & {
  "data-slot"?: unknown;
};
export function ComboBoxIndicator({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: ComboBoxIndicatorProps) {
  const compiled = stylex.props(comboBoxStyles.icon, xstyle);
  return (
    <BaseCombobox.Icon
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Icon.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-indicator"}
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
    </BaseCombobox.Icon>
  );
}
export type ComboBoxPortalProps = ComponentPropsWithRef<typeof BaseCombobox.Portal>;
export function ComboBoxPortal({ container, ...props }: ComboBoxPortalProps) {
  const themeContainer = useThemePortalContainer();
  return (
    <BaseCombobox.Portal
      {...props}
      container={container === undefined ? (themeContainer ?? undefined) : container}
    />
  );
}
export function ComboBoxPositioner({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Positioner.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.positioner, xstyle);
  return (
    <BaseCombobox.Positioner
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Positioner.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-positioner"}
    />
  );
}
export function ComboBoxPopover({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Popup.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.popover, xstyle);
  return (
    <BaseCombobox.Popup
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Popup.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-popover"}
    />
  );
}
export function ComboBoxList({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.List.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.list, xstyle);
  return (
    <BaseCombobox.List
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.List.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-list"}
    />
  );
}
export function ComboBoxItem({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Item.Props> & { "data-slot"?: unknown }) {
  const { keyboardHighlight } = useContext(AppearanceContext);
  const compiled = stylex.props(comboBoxSharedStyles.item, xstyle);
  return (
    <BaseCombobox.Item
      {...props}
      {...compiled}
      data-keyboard-highlight={keyboardHighlight ? "" : undefined}
      style={mergeStyle<BaseCombobox.Item.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-item"}
    />
  );
}
export type ComboBoxItemIndicatorProps = StyleXProps<BaseCombobox.ItemIndicator.Props> & {
  "data-slot"?: unknown;
};
export function ComboBoxItemIndicator({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: ComboBoxItemIndicatorProps) {
  const compiled = stylex.props(comboBoxSharedStyles.itemIndicator, xstyle);
  return (
    <BaseCombobox.ItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.ItemIndicator.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-item-indicator"}
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
    </BaseCombobox.ItemIndicator>
  );
}
export function ComboBoxLabel({
  htmlFor,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"label">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.label, xstyle);
  return (
    <label
      {...props}
      {...compiled}
      htmlFor={htmlFor}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "combo-box-label"}
    />
  );
}
export function ComboBoxGroup({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Group.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(xstyle);
  return (
    <BaseCombobox.Group
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Group.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-group"}
    />
  );
}
export function ComboBoxGroupLabel({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.GroupLabel.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.groupLabel, xstyle);
  return (
    <BaseCombobox.GroupLabel
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.GroupLabel.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-group-label"}
    />
  );
}
export function ComboBoxSeparator({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Separator.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.separator, xstyle);
  return (
    <BaseCombobox.Separator
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Separator.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-separator"}
    />
  );
}
export function ComboBoxArrow({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Arrow.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.arrow, xstyle);
  return (
    <BaseCombobox.Arrow
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Arrow.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-arrow"}
    />
  );
}
export function ComboBoxEmpty({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Empty.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxStyles.empty, xstyle);
  return (
    <BaseCombobox.Empty
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Empty.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-empty"}
    />
  );
}
export function ComboBoxClearButton({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Clear.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxStyles.clear, xstyle);
  return (
    <BaseCombobox.Clear
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Clear.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-clear-button"}
    />
  );
}
export function ComboBoxChips({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Chips.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxStyles.chips, xstyle);
  return (
    <BaseCombobox.Chips
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Chips.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-chips"}
    />
  );
}
export function ComboBoxChip({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Chip.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxStyles.chip, xstyle);
  return (
    <BaseCombobox.Chip
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Chip.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-chip"}
    />
  );
}
export function ComboBoxChipRemove({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.ChipRemove.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxStyles.chipRemove, xstyle);
  return (
    <BaseCombobox.ChipRemove
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.ChipRemove.State>(compiled.style, style)}
      data-slot={slot ?? "combo-box-chip-remove"}
    />
  );
}
export const ComboBoxCollection = BaseCombobox.Collection;
export const ComboBoxRow = BaseCombobox.Row;
export const ComboBoxStatus = BaseCombobox.Status;
export const ComboBoxBackdrop = BaseCombobox.Backdrop;
export const useComboBoxFilter = BaseCombobox.useFilter;
export type ComboBoxRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseCombobox.Root.Props<Value, Multiple> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export type ComboBoxInputProps = ComponentPropsWithRef<typeof ComboBoxInput>;
export type ComboBoxTriggerProps = ComponentPropsWithRef<typeof ComboBoxTrigger>;
export type ComboBoxPopoverProps = ComponentPropsWithRef<typeof ComboBoxPopover>;
export type ComboBoxPositionerProps = ComponentPropsWithRef<typeof ComboBoxPositioner>;
export type ComboBoxListProps = ComponentPropsWithRef<typeof ComboBoxList>;
export type ComboBoxItemProps = ComponentPropsWithRef<typeof ComboBoxItem>;
