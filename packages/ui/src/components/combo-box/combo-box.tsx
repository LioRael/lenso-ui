"use client";
import { materialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "../../utils/materials/render.js";
import * as Sdk from "@ui-sdk/react/combobox";
import { slotRender } from "../../utils/sdk-render.js";
/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: UI SDK native combobox, including multiple selection and chips.
 */
import { comboBoxStyles, comboBoxSharedStyles } from "@lenso/tokens/combo-box";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithRef,
} from "react";
import { assignRef } from "../../utils/interaction/ref.js";
import { glassStyles } from "@lenso/tokens/glass";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import { inputStyles } from "@lenso/tokens/input";
import { useGlassRef } from "@lenso/glass/react";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

const AppearanceContext = createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
  keyboardHighlight: false,
});
const InputGroupContext = createContext(false);
const AnchorContext = createContext<{
  element: HTMLElement | null;
  setElement: (element: HTMLElement | null) => void;
} | null>(null);
export type ComboBoxInputGroupProps = StyleXProps<React.ComponentPropsWithRef<"div">> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-lenso-slot"?: unknown;
};
export function ComboBoxInputGroup({
  ref,
  variant,
  fullWidth,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: ComboBoxInputGroupProps) {
  const inherited = useContext(AppearanceContext);
  const setAnchor = useContext(AnchorContext)?.setElement;
  const register = useCallback(
    (node: HTMLDivElement | null) => {
      setAnchor?.(node);
      const cleanup = assignRef(ref, node);
      return () => {
        setAnchor?.(null);
        cleanup();
      };
    },
    [ref, setAnchor],
  );
  const glassRef = useFocusMethodRef(useGlassRef(register, true));
  const compiled = stylex.props(
    comboBoxStyles.inputGroup,
    comboBoxStyles.field,
    glassStyles.optics,
    inputGroupMaterialStyles.root,
    (variant ?? inherited.variant) === "secondary" && inputGroupMaterialStyles.secondary,
    (fullWidth ?? inherited.fullWidth) && inputGroupMaterialStyles.fullWidth,
    xstyle,
  );
  return (
    <InputGroupContext value={true}>
      <div
        {...props}
        ref={glassRef}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-lenso-slot={slot ?? "combo-box-input-group"}
      />
    </InputGroupContext>
  );
}
export function ComboBoxInput({
  ref,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxInput>> & { "data-lenso-slot"?: unknown }) {
  const grouped = useContext(InputGroupContext);
  const appearance = useContext(AppearanceContext);
  const glassRef = useFocusMethodRef(useGlassRef(ref, !grouped));
  const compiled = stylex.props(
    comboBoxStyles.input,
    grouped ? comboBoxStyles.groupedInput : comboBoxStyles.field,
    !grouped && inputStyles.glass,
    !grouped && glassStyles.optics,
    grouped && inputGroupMaterialStyles.input,
    !grouped && appearance.variant === "secondary" && comboBoxStyles.secondary,
    !grouped && comboBoxStyles.standaloneInput,
    xstyle,
  );
  return (
    <Sdk.ComboboxInput
      {...props}
      ref={glassRef}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("input", slot ?? "combo-box-input", props.render)}
    />
  );
}
export const ComboBoxValue = Sdk.ComboboxValue;
export function ComboBoxTrigger({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxTrigger>> & {
  "data-lenso-slot"?: unknown;
}) {
  const grouped = useContext(InputGroupContext);
  const compiled = stylex.props(
    comboBoxStyles.trigger,
    grouped && comboBoxStyles.groupedTrigger,
    !grouped && comboBoxStyles.standaloneTrigger,
    xstyle,
  );
  return (
    <Sdk.ComboboxTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", slot ?? "combo-box-trigger", props.render)}
    />
  );
}
export type ComboBoxIndicatorProps = StyleXProps<React.ComponentPropsWithRef<"span">> & {
  "data-lenso-slot"?: unknown;
};
export function ComboBoxIndicator({
  children,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: ComboBoxIndicatorProps) {
  const compiled = stylex.props(comboBoxStyles.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "combo-box-indicator"}
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
    </span>
  );
}
export function ComboBoxContent({
  children,
  xstyle,
  style,
  sideOffset = 8,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxContent>>) {
  const anchor = useContext(AnchorContext)?.element;
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles.accessible,
    comboBoxSharedStyles.positioner,
    comboBoxSharedStyles.popover,
    xstyle,
  );
  return (
    <Sdk.ComboboxContent
      anchor={anchor}
      {...props}
      {...compiled}
      sideOffset={sideOffset}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "combo-box-popover", props.render)}
      data-material="glass-small"
    >
      {(state) => (
        <>
          <MaterialBackground variant="glass-small" liveBackdrop />
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </Sdk.ComboboxContent>
  );
}
export function ComboBoxList({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxList>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.list, xstyle);
  return (
    <Sdk.ComboboxList
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-list", props.render)}
    />
  );
}
export function ComboBoxItem({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxItem>> & { "data-lenso-slot"?: unknown }) {
  const { keyboardHighlight } = useContext(AppearanceContext);
  const compiled = stylex.props(comboBoxSharedStyles.item, xstyle);
  return (
    <Sdk.ComboboxItem
      {...props}
      {...compiled}
      data-keyboard-highlight={keyboardHighlight ? "" : undefined}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-item", props.render)}
    />
  );
}
export type ComboBoxItemIndicatorProps = StyleXProps<
  React.ComponentProps<typeof Sdk.ComboboxItemIndicator>
> & {
  "data-lenso-slot"?: unknown;
};
export function ComboBoxItemIndicator({
  children,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: ComboBoxItemIndicatorProps) {
  const compiled = stylex.props(comboBoxSharedStyles.itemIndicator, xstyle);
  return (
    <Sdk.ComboboxItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-item-indicator", props.render)}
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
    </Sdk.ComboboxItemIndicator>
  );
}
export function ComboBoxLabel({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxLabel>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.label, xstyle);
  return (
    <Sdk.ComboboxLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("label", slot ?? "combo-box-label", props.render)}
    />
  );
}
export function ComboBoxGroup({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxGroup>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(xstyle);
  return (
    <Sdk.ComboboxGroup
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-group", props.render)}
    />
  );
}
export function ComboBoxGroupLabel({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxGroupLabel>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(comboBoxSharedStyles.groupLabel, xstyle);
  return (
    <Sdk.ComboboxGroupLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-group-label", props.render)}
    />
  );
}
export function ComboBoxSeparator({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxSeparator>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(comboBoxSharedStyles.separator, xstyle);
  return (
    <Sdk.ComboboxSeparator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-separator", props.render)}
    />
  );
}
export function ComboBoxArrow({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxArrow>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxSharedStyles.arrow, xstyle);
  return (
    <Sdk.ComboboxArrow
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-arrow", props.render)}
    />
  );
}
export function ComboBoxEmpty({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxEmpty>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxStyles.empty, xstyle);
  return (
    <Sdk.ComboboxEmpty
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-empty", props.render)}
    />
  );
}
export function ComboBoxClearButton({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxClear>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxStyles.clear, xstyle);
  return (
    <Sdk.ComboboxClear
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", slot ?? "combo-box-clear-button", props.render)}
    />
  );
}
export function ComboBoxChips({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxChips>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxStyles.chips, xstyle);
  return (
    <Sdk.ComboboxChips
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-chips", props.render)}
    />
  );
}
export function ComboBoxChip({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxChip>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(comboBoxStyles.chip, xstyle);
  return (
    <Sdk.ComboboxChip
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-chip", props.render)}
    />
  );
}
export function ComboBoxChipRemove({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ComboboxChipRemove>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(comboBoxStyles.chipRemove, xstyle);
  return (
    <Sdk.ComboboxChipRemove
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "combo-box-chip-remove", props.render)}
    />
  );
}
export const ComboBoxStatus = Sdk.ComboboxStatus;
export type ComboBoxInputProps = ComponentPropsWithRef<typeof ComboBoxInput>;
export type ComboBoxTriggerProps = ComponentPropsWithRef<typeof ComboBoxTrigger>;
export type ComboBoxContentProps = ComponentPropsWithRef<typeof ComboBoxContent>;
export type ComboBoxListProps = ComponentPropsWithRef<typeof ComboBoxList>;
export type ComboBoxItemProps = ComponentPropsWithRef<typeof ComboBoxItem>;

export type ComboBoxRootProps<
  Value = string,
  Multiple extends boolean | undefined = false,
> = Sdk.ComboboxProps<Value, Multiple> & { variant?: "primary" | "secondary"; fullWidth?: boolean };
export function ComboBoxRoot<Value = string, Multiple extends boolean | undefined = false>(
  props: ComboBoxRootProps<Value, Multiple>,
) {
  const { variant = "primary", fullWidth = false } = props;
  const [keyboardHighlight, setKeyboardHighlight] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const anchor = useMemo(() => ({ element, setElement }), [element]);
  const appearance = useMemo(
    () => ({ variant, fullWidth, keyboardHighlight }),
    [variant, fullWidth, keyboardHighlight],
  );
  return (
    <AppearanceContext value={appearance}>
      <AnchorContext value={anchor}>
        <InputGroupContext value={false}>
          <Sdk.Combobox<Value, Multiple>
            {...props}
            onHighlight={(value, details) => {
              setKeyboardHighlight(details.event?.type.startsWith("key") ?? false);
              props.onHighlight?.(value, details);
            }}
          />
        </InputGroupContext>
      </AnchorContext>
    </AppearanceContext>
  );
}
