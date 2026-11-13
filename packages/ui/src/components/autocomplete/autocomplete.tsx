"use client";
import { materialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "../../utils/materials/render.js";
import * as Sdk from "@ui-sdk/react/autocomplete";
import { slotRender } from "../../utils/sdk-render.js";
/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: native UI SDK combobox with popup search; no React Aria Filter adapter.
 */
import {
  autocompleteStyles,
  autocompleteFieldStyles,
  autocompleteSharedStyles,
} from "@lenso/tokens/autocomplete";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ComponentPropsWithRef,
} from "react";
import { assignRef } from "../../utils/interaction/ref.js";
import { InputGroupRoot } from "../input-group/input-group.js";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import { comboBoxStyles } from "@lenso/tokens/combo-box";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";

const AutocompleteStyleContext = createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
  virtualized: false,
  keyboardHighlight: false,
});
const AnchorContext = createContext<{
  element: HTMLElement | null;
  setElement: (element: HTMLElement | null) => void;
} | null>(null);
const InputGroupContext = createContext(false);
export function AutocompleteInputGroup({
  ref,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const setAnchor = useContext(AnchorContext)?.setElement;
  const appearance = useContext(AutocompleteStyleContext);
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
  return (
    <InputGroupContext value>
      <InputGroupRoot
        {...props}
        ref={register}
        glass
        variant={appearance.variant}
        fullWidth={appearance.fullWidth}
        xstyle={xstyle}
        style={style}
        data-lenso-slot={slot ?? "autocomplete-input-group"}
      />
    </InputGroupContext>
  );
}
export function AutocompleteInput({
  ref,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteInput>> & {
  "data-lenso-slot"?: unknown;
}) {
  const focusRef = useFocusMethodRef(ref);
  const grouped = useContext(InputGroupContext);
  const compiled = stylex.props(
    autocompleteStyles.input,
    grouped && inputGroupMaterialStyles.input,
    xstyle,
  );
  return (
    <Sdk.AutocompleteInput
      ref={focusRef}
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("input", slot ?? "autocomplete-input", props.render)}
    />
  );
}
export type AutocompleteTriggerProps = StyleXProps<
  React.ComponentProps<typeof Sdk.AutocompleteTrigger>
> & {
  "data-lenso-slot"?: unknown;
};
export function AutocompleteTrigger({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: AutocompleteTriggerProps) {
  const inherited = useContext(AutocompleteStyleContext);
  const grouped = useContext(InputGroupContext);
  const compiled = stylex.props(
    grouped
      ? [comboBoxStyles.trigger, comboBoxStyles.groupedTrigger]
      : autocompleteSharedStyles.trigger,
    !grouped && inherited.variant === "secondary" && autocompleteSharedStyles.secondary,
    !grouped && inherited.fullWidth && autocompleteSharedStyles.fullWidth,
    xstyle,
  );
  return (
    <Sdk.AutocompleteTrigger
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", slot ?? "autocomplete-trigger", props.render)}
    />
  );
}
export type AutocompleteIndicatorProps = StyleXProps<React.ComponentPropsWithRef<"span">> & {
  "data-lenso-slot"?: unknown;
};
export function AutocompleteIndicator({
  children,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: AutocompleteIndicatorProps) {
  const compiled = stylex.props(autocompleteSharedStyles.indicator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "autocomplete-indicator"}
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
export function AutocompleteContent({
  children,
  xstyle,
  style,
  sideOffset = 8,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteContent>>) {
  const anchor = useContext(AnchorContext)?.element;
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles.accessible,
    autocompleteSharedStyles.positioner,
    autocompleteStyles.popover,
    xstyle,
  );
  return (
    <Sdk.AutocompleteContent
      anchor={anchor}
      {...props}
      {...compiled}
      sideOffset={sideOffset}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "autocomplete-popover", props.render)}
      data-material="glass-small"
    >
      {(state) => (
        <>
          <MaterialBackground variant="glass-small" liveBackdrop />
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </Sdk.AutocompleteContent>
  );
}
export function AutocompleteList({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteList>> & {
  "data-lenso-slot"?: unknown;
}) {
  const { virtualized } = useContext(AutocompleteStyleContext);
  const compiled = stylex.props(autocompleteStyles.list, xstyle);
  return (
    <Sdk.AutocompleteList
      data-virtualized={virtualized ? "" : undefined}
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "autocomplete-list", props.render)}
    />
  );
}
export function AutocompleteItem({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteItem>> & {
  "data-lenso-slot"?: unknown;
}) {
  const { keyboardHighlight } = useContext(AutocompleteStyleContext);
  const compiled = stylex.props(autocompleteSharedStyles.item, xstyle);
  return (
    <Sdk.AutocompleteItem
      {...props}
      {...compiled}
      data-keyboard-highlight={keyboardHighlight ? "" : undefined}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "autocomplete-item", props.render)}
    />
  );
}
export function AutocompleteLabel({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteLabel>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(autocompleteSharedStyles.label, xstyle);
  return (
    <Sdk.AutocompleteLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("label", slot ?? "autocomplete-label", props.render)}
    />
  );
}
export function AutocompleteGroup({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteGroup>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(xstyle);
  return (
    <Sdk.AutocompleteGroup
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "autocomplete-group", props.render)}
    />
  );
}
export function AutocompleteGroupLabel({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteGroupLabel>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(autocompleteSharedStyles.groupLabel, xstyle);
  return (
    <Sdk.AutocompleteGroupLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "autocomplete-group-label", props.render)}
    />
  );
}
export function AutocompleteSeparator({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteSeparator>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(autocompleteSharedStyles.separator, xstyle);
  return (
    <Sdk.AutocompleteSeparator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "autocomplete-separator", props.render)}
    />
  );
}
export function AutocompleteArrow({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteArrow>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(autocompleteSharedStyles.arrow, xstyle);
  return (
    <Sdk.AutocompleteArrow
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "autocomplete-arrow", props.render)}
    />
  );
}
export function AutocompleteEmpty({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteEmpty>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(autocompleteFieldStyles.empty, xstyle);
  return (
    <Sdk.AutocompleteEmpty
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "autocomplete-empty", props.render)}
    />
  );
}
export function AutocompleteClearButton({
  children,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.AutocompleteClear>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(autocompleteFieldStyles.clear, xstyle);
  return (
    <Sdk.AutocompleteClear
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", slot ?? "autocomplete-clear-button", props.render)}
    >
      {children ?? (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m4 4 8 8m0-8-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </Sdk.AutocompleteClear>
  );
}
export const AutocompleteStatus = Sdk.AutocompleteStatus;
export type AutocompleteInputProps = ComponentPropsWithRef<typeof AutocompleteInput>;
export type AutocompleteContentProps = ComponentPropsWithRef<typeof AutocompleteContent>;
export type AutocompleteListProps = ComponentPropsWithRef<typeof AutocompleteList>;
export type AutocompleteItemProps = ComponentPropsWithRef<typeof AutocompleteItem>;

export type AutocompleteRootProps = Sdk.AutocompleteProps & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export function AutocompleteRoot({
  variant = "primary",
  fullWidth = false,
  onHighlight,
  ...props
}: AutocompleteRootProps) {
  const [keyboardHighlight, setKeyboardHighlight] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);
  const anchor = useMemo(() => ({ element, setElement }), [element]);
  const appearance = useMemo(
    () => ({ variant, fullWidth, keyboardHighlight, virtualized: false }),
    [variant, fullWidth, keyboardHighlight],
  );
  return (
    <AutocompleteStyleContext value={appearance}>
      <AnchorContext value={anchor}>
        <Sdk.Autocomplete
          {...props}
          onHighlight={(value, details) => {
            setKeyboardHighlight(details.event?.type.startsWith("key") ?? false);
            onHighlight?.(value, details);
          }}
        />
      </AnchorContext>
    </AutocompleteStyleContext>
  );
}
