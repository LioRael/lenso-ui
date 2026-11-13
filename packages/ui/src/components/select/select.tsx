"use client";
import * as Sdk from "@ui-sdk/react/select";
import { slotRender } from "../../utils/sdk-render.js";
/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: native UI SDK selection/collection API and scoped portals.
 */
import { menuStyles, menuItemStyles, menuSectionStyles } from "@lenso/tokens/menu";
import { materialStyles } from "@lenso/tokens/materials";
import { MaterialBackground } from "../../utils/materials/render.js";
import { selectStyles } from "@lenso/tokens/select";
import { popupButtonStyles } from "@lenso/tokens/popup-button";
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useCallback,
  isValidElement,
  type ComponentPropsWithRef,
} from "react";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

import { useMenuPopupRef } from "../../utils/interaction/menu.js";
import { usePopupExit } from "../../utils/interaction/popup-exit.js";
import { assignRef } from "../../utils/interaction/ref.js";

const SelectMotion = createContext<{
  trigger: React.RefObject<HTMLElement | null>;
  popup: React.RefObject<HTMLDivElement | null>;
  finishExit: () => void;
  morph: boolean;
} | null>(null);

const SelectStyleContext = createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
});
export type SelectTriggerProps = StyleXProps<React.ComponentProps<typeof Sdk.SelectTrigger>> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-lenso-slot"?: unknown;
};
export function SelectTrigger({
  ref,
  render,
  variant,
  fullWidth,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: SelectTriggerProps) {
  const inherited = useContext(SelectStyleContext);
  const motion = useContext(SelectMotion);
  const register = useCallback(
    (node: HTMLElement | null) => {
      const own = assignRef(motion?.trigger, node);
      const caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [motion?.trigger, ref],
  );
  const ownPresentation = !render || (isValidElement(render) && typeof render.type === "string");
  const compiled = stylex.props(
    ownPresentation && popupButtonStyles.root,
    ownPresentation && selectStyles.validation,
    ownPresentation && (variant ?? inherited.variant) === "secondary" && selectStyles.secondary,
    ownPresentation && (fullWidth ?? inherited.fullWidth) && selectStyles.fullWidth,
    xstyle,
  );
  return (
    <Sdk.SelectTrigger
      {...props}
      ref={register}

      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", slot ?? "select-trigger", render)}
    />
  );
}
export function SelectValue({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.SelectValue>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.value, xstyle);
  return (
    <Sdk.SelectValue
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-value", props.render)}
    />
  );
}
export type SelectIndicatorProps = StyleXProps<React.ComponentPropsWithRef<"span">> & {
  "data-lenso-slot"?: unknown;
};
export function SelectIndicator({
  children,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: SelectIndicatorProps) {
  const compiled = stylex.props(selectStyles.indicator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={slot ?? "select-indicator"}
    >
      {children ?? (
        <svg width="14" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m5 5 3-3 3 3 M5 11l3 3 3-3"
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
export function SelectContent({
  ref,
  children,
  xstyle,
  style,
  sideOffset = 8,
  alignItemWithTrigger = true,
  // Match the trigger text after the list's 8px padding and 36px check gutter.
  alignOffset = alignItemWithTrigger ? -44 : 0,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.SelectContent>>) {
  const motion = useContext(SelectMotion)!;
  const popupRef = useMenuPopupRef(
    ref,
    motion.popup,
    motion.trigger,
    motion.finishExit,
    motion.morph,
    true,
    "select",
  );
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles.accessible,
    menuStyles.popup,
    menuStyles.morph,
    selectStyles.positioner,
    selectStyles.popover,
    selectStyles.typography,
    xstyle,
  );
  return (
    <Sdk.SelectContent
      {...props}
      {...compiled}
      ref={popupRef}
      sideOffset={sideOffset}
      alignItemWithTrigger={alignItemWithTrigger}
      alignOffset={alignOffset}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "select-popover", props.render)}
      data-material="glass-medium"
      data-menu-elastic="false"
    >
      {(state) => (
        <>
          <div
            data-lenso-slot="select-surface"
            data-material-hidden={state.presentation === "sheet" ? undefined : ""}
            aria-hidden="true"
            {...stylex.props(menuStyles.surface)}
          >
            <MaterialBackground
              variant="glass-medium"
              sourceAnchor={motion.trigger}
              liveBackdrop
              deferOptics={state.presentation !== "sheet"}
            />
          </div>
          <div
            data-lenso-slot="select-glyph"
            aria-hidden="true"
            inert
            {...stylex.props(menuStyles.glyph)}
          />
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </Sdk.SelectContent>
  );
}
export function SelectList({
  children,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.SelectList>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(menuStyles.content, selectStyles.list, xstyle);
  return (
    <Sdk.SelectList
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-list", props.render)}
      data-select-content=""
    >
      {(state) => (
        <>
          <div
            data-lenso-slot="select-plate"
            aria-hidden="true"
            {...stylex.props(menuStyles.plate)}
          />
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </Sdk.SelectList>
  );
}
export function SelectItem({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof Sdk.SelectItem>, "ref"> & React.RefAttributes<HTMLDivElement>
> & {
  "data-lenso-slot"?: unknown;
}) {
  const { variant } = useContext(SelectStyleContext);
  const compiled = stylex.props(
    menuItemStyles.root,
    selectStyles.item,
    variant === "primary" && selectStyles.primaryItem,
    xstyle,
  );
  return (
    <Sdk.SelectItem
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-item", props.render)}
    />
  );
}
export function SelectItemText({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.SelectItemText>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.itemText, xstyle);
  return (
    <Sdk.SelectItemText
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-item-text", props.render)}
    />
  );
}
export type SelectItemIndicatorProps = StyleXProps<
  React.ComponentProps<typeof Sdk.SelectItemIndicator>
> & {
  "data-lenso-slot"?: unknown;
};
export function SelectItemIndicator({
  children,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: SelectItemIndicatorProps) {
  const compiled = stylex.props(menuItemStyles.indicator, xstyle);
  return (
    <Sdk.SelectItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-item-indicator", props.render)}
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
    </Sdk.SelectItemIndicator>
  );
}
export function SelectLabel({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.SelectLabel>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.label, xstyle);
  return (
    <Sdk.SelectLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-label", props.render)}
    />
  );
}
export function SelectGroup({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.SelectGroup>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(xstyle);
  return (
    <Sdk.SelectGroup
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-group", props.render)}
    />
  );
}
export function SelectGroupLabel({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.SelectGroupLabel>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(menuSectionStyles.label, xstyle);
  return (
    <Sdk.SelectGroupLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-group-label", props.render)}
    />
  );
}
export function SelectSeparator({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.SelectSeparator>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(menuStyles.separator, xstyle);
  return (
    <Sdk.SelectSeparator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-separator", props.render)}
    />
  );
}
export function SelectArrow({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.SelectArrow>> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(selectStyles.arrow, xstyle);
  return (
    <Sdk.SelectArrow
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", slot ?? "select-arrow", props.render)}
    />
  );
}
export type SelectValueProps = ComponentPropsWithRef<typeof SelectValue>;
export type SelectContentProps = ComponentPropsWithRef<typeof SelectContent>;
export type SelectListProps = ComponentPropsWithRef<typeof SelectList>;
export type SelectItemProps = ComponentPropsWithRef<typeof SelectItem>;

export type SelectRootProps<
  Value = string,
  Multiple extends boolean | undefined = false,
> = Sdk.SelectProps<Value, Multiple> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  morphTrigger?: boolean;
};
export function SelectRoot<Value = string, Multiple extends boolean | undefined = false>(
  props: SelectRootProps<Value, Multiple>,
) {
  const {
    variant = "primary",
    fullWidth = false,
    morphTrigger = true,
    onOpenChange,
    ...native
  } = props;
  const trigger = useRef<HTMLElement>(null);
  const { popup, holdExit, finishExit } = usePopupExit(props.open);
  const motion = useMemo(
    () => ({ trigger, popup, finishExit, morph: morphTrigger }),
    [popup, finishExit, morphTrigger],
  );
  const appearance = useMemo(() => ({ variant, fullWidth }), [variant, fullWidth]);
  return (
    <SelectMotion value={motion}>
      <SelectStyleContext value={appearance}>
        <Sdk.Select<Value, Multiple>
          {...(native as Sdk.SelectProps<Value, Multiple>)}
          onOpenChange={(open, details) => {
            onOpenChange?.(open, details);
            if (!details.canceled) holdExit(open);
          }}
        />
      </SelectStyleContext>
    </SelectMotion>
  );
}
