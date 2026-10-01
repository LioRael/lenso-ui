"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI combobox with popup search; no React Aria Filter adapter.
 */
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import {
  autocompleteStyles,
  autocompleteFieldStyles,
  autocompleteSharedStyles,
} from "@lenso/tokens/autocomplete";
import { createContext, useContext, useMemo, type ComponentPropsWithRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useThemePortalContainer } from "../../utils/theme-scope.js";

const AutocompleteStyleContext = createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
});
export function AutocompleteRoot<Value, Multiple extends boolean | undefined = false>({
  variant = "primary",
  fullWidth = false,
  ...props
}: AutocompleteRootProps<Value, Multiple>) {
  const appearance = useMemo(() => ({ variant, fullWidth }), [variant, fullWidth]);
  return (
    <AutocompleteStyleContext value={appearance}>
      <BaseCombobox.Root {...props} />
    </AutocompleteStyleContext>
  );
}
export function AutocompleteInputGroup({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.InputGroup.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteFieldStyles.inputGroup, xstyle);
  return (
    <BaseCombobox.InputGroup
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.InputGroup.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-input-group"}
    />
  );
}
export function AutocompleteInput({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Input.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteStyles.input, xstyle);
  return (
    <BaseCombobox.Input
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Input.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-input"}
    />
  );
}
export const AutocompleteValue = BaseCombobox.Value;
export type AutocompleteTriggerProps = StyleXProps<BaseCombobox.Trigger.Props> & {
  "data-slot"?: unknown;
};
export function AutocompleteTrigger({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: AutocompleteTriggerProps) {
  const inherited = useContext(AutocompleteStyleContext);
  const compiled = stylex.props(
    autocompleteSharedStyles.trigger,
    inherited.variant === "secondary" && autocompleteSharedStyles.secondary,
    inherited.fullWidth && autocompleteSharedStyles.fullWidth,
    xstyle,
  );
  return (
    <BaseCombobox.Trigger
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Trigger.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-trigger"}
    />
  );
}
export type AutocompleteIndicatorProps = StyleXProps<BaseCombobox.Icon.Props> & {
  "data-slot"?: unknown;
};
export function AutocompleteIndicator({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: AutocompleteIndicatorProps) {
  const compiled = stylex.props(autocompleteSharedStyles.indicator, xstyle);
  return (
    <BaseCombobox.Icon
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Icon.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-indicator"}
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
export type AutocompletePortalProps = ComponentPropsWithRef<typeof BaseCombobox.Portal>;
export function AutocompletePortal({ container, ...props }: AutocompletePortalProps) {
  const themeContainer = useThemePortalContainer();
  return (
    <BaseCombobox.Portal
      {...props}
      container={container === undefined ? (themeContainer ?? undefined) : container}
    />
  );
}
export function AutocompletePositioner({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Positioner.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteSharedStyles.positioner, xstyle);
  return (
    <BaseCombobox.Positioner
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Positioner.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-positioner"}
    />
  );
}
export function AutocompletePopover({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Popup.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteStyles.popover, xstyle);
  return (
    <BaseCombobox.Popup
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Popup.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-popover"}
    />
  );
}
export function AutocompleteList({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.List.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteStyles.list, xstyle);
  return (
    <BaseCombobox.List
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.List.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-list"}
    />
  );
}
export function AutocompleteItem({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Item.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteSharedStyles.item, xstyle);
  return (
    <BaseCombobox.Item
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Item.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-item"}
    />
  );
}
export type AutocompleteItemIndicatorProps = StyleXProps<BaseCombobox.ItemIndicator.Props> & {
  "data-slot"?: unknown;
};
export function AutocompleteItemIndicator({
  children,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: AutocompleteItemIndicatorProps) {
  const compiled = stylex.props(autocompleteSharedStyles.itemIndicator, xstyle);
  return (
    <BaseCombobox.ItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.ItemIndicator.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-item-indicator"}
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
export function AutocompleteLabel({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Label.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteSharedStyles.label, xstyle);
  return (
    <BaseCombobox.Label
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Label.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-label"}
    />
  );
}
export function AutocompleteGroup({
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
      data-slot={slot ?? "autocomplete-group"}
    />
  );
}
export function AutocompleteGroupLabel({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.GroupLabel.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteSharedStyles.groupLabel, xstyle);
  return (
    <BaseCombobox.GroupLabel
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.GroupLabel.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-group-label"}
    />
  );
}
export function AutocompleteSeparator({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Separator.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteSharedStyles.separator, xstyle);
  return (
    <BaseCombobox.Separator
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Separator.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-separator"}
    />
  );
}
export function AutocompleteArrow({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Arrow.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteSharedStyles.arrow, xstyle);
  return (
    <BaseCombobox.Arrow
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Arrow.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-arrow"}
    />
  );
}
export function AutocompleteEmpty({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Empty.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteFieldStyles.empty, xstyle);
  return (
    <BaseCombobox.Empty
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Empty.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-empty"}
    />
  );
}
export function AutocompleteClearButton({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Clear.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteFieldStyles.clear, xstyle);
  return (
    <BaseCombobox.Clear
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Clear.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-clear-button"}
    />
  );
}
export function AutocompleteChips({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Chips.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteFieldStyles.chips, xstyle);
  return (
    <BaseCombobox.Chips
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Chips.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-chips"}
    />
  );
}
export function AutocompleteChip({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.Chip.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteFieldStyles.chip, xstyle);
  return (
    <BaseCombobox.Chip
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.Chip.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-chip"}
    />
  );
}
export function AutocompleteChipRemove({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseCombobox.ChipRemove.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(autocompleteFieldStyles.chipRemove, xstyle);
  return (
    <BaseCombobox.ChipRemove
      {...props}
      {...compiled}
      style={mergeStyle<BaseCombobox.ChipRemove.State>(compiled.style, style)}
      data-slot={slot ?? "autocomplete-chip-remove"}
    />
  );
}
export const AutocompleteCollection = BaseCombobox.Collection;
export const AutocompleteRow = BaseCombobox.Row;
export const AutocompleteStatus = BaseCombobox.Status;
export const AutocompleteBackdrop = BaseCombobox.Backdrop;
export const useAutocompleteFilter = BaseCombobox.useFilter;
export type AutocompleteRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseCombobox.Root.Props<Value, Multiple> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export type AutocompleteInputProps = ComponentPropsWithRef<typeof AutocompleteInput>;
export type AutocompletePopoverProps = ComponentPropsWithRef<typeof AutocompletePopover>;
export type AutocompletePositionerProps = ComponentPropsWithRef<typeof AutocompletePositioner>;
export type AutocompleteListProps = ComponentPropsWithRef<typeof AutocompleteList>;
export type AutocompleteItemProps = ComponentPropsWithRef<typeof AutocompleteItem>;
