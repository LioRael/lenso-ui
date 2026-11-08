"use client";
// Modified: Base UI owns the popover, focus restoration and render composition.
import { isValidElement, type ComponentPropsWithRef, type ReactNode } from "react";
import { Popover as Base } from "@base-ui/react/popover";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import type { ColorPickerProps, ColorPickerState } from "react-stately/useColorPickerState";
import * as stylex from "@stylexjs/stylex";
import { materialStyles } from "@lenso/tokens/materials";
import { popoverStyles } from "@lenso/tokens/popover";
import { MaterialBackground } from "../../utils/materials/render.js";
import { colorPickerStyles as styles } from "@lenso/tokens/color-picker";
import {
  controlButtonStyles as buttonStyles,
  controlButtonSizes as buttonSizes,
  controlButtonVariants as buttonVariants,
} from "@lenso/tokens/button";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { ColorValueContext, useColorValue } from "../../utils/color-state.js";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { PopoverPortal } from "../popover/popover.js";

export type ColorPickerRootProps = StyleXProps<
  Omit<useRender.ComponentProps<"div">, "children" | "onChange" | "defaultValue">
> &
  ColorPickerProps &
  Pick<
    Base.Root.Props,
    | "open"
    | "defaultOpen"
    | "onOpenChange"
    | "onOpenChangeComplete"
    | "modal"
    | "triggerId"
    | "defaultTriggerId"
  > & { children?: ReactNode | ((state: ColorPickerState) => ReactNode) };
export function ColorPickerRoot({
  children,
  value,
  defaultValue,
  onChange,
  open,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  modal,
  triggerId,
  defaultTriggerId,
  render,
  ref,
  xstyle,
  style,
  ...props
}: ColorPickerRootProps) {
  const state = useColorValue({ value, defaultValue, onChange });
  const compiled = stylex.props(styles.root, xstyle);
  const element = useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps(compiled, props, {
      "data-slot": props["data-slot"] ?? "color-picker",
      style: mergeStyle(compiled.style, style),
      children: typeof children === "function" ? children(state) : children,
    }),
  });
  return (
    <ColorValueContext value={state}>
      <Base.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
        onOpenChangeComplete={onOpenChangeComplete}
        modal={modal}
        triggerId={triggerId}
        defaultTriggerId={defaultTriggerId}
      >
        {element}
      </Base.Root>
    </ColorValueContext>
  );
}
export type ColorPickerTriggerProps = StyleXProps<ComponentPropsWithRef<typeof Base.Trigger>>;
export function ColorPickerTrigger({
  ref,
  render,
  xstyle,
  style,
  ...props
}: ColorPickerTriggerProps) {
  const own = !render || (isValidElement(render) && typeof render.type === "string");
  const glassRef = useElasticRef(useGlassRef(ref, own), { enabled: own });
  const compiled = stylex.props(
    own && buttonStyles.root,
    own && buttonSizes.md,
    own && buttonVariants.glass,
    own && buttonStyles.material,
    own && buttonStyles.glass,
    xstyle,
  );
  return (
    <Base.Trigger
      {...props}
      {...compiled}
      render={render}
      ref={glassRef}
      data-slot={props["data-slot"] ?? "color-picker-trigger"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export type ColorPickerPopoverProps = StyleXProps<ComponentPropsWithRef<typeof Base.Popup>> &
  Pick<
    Base.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "collisionPadding" | "collisionBoundary"
  > & {
    placement?:
      | "top"
      | "bottom"
      | "left"
      | "right"
      | "top start"
      | "top end"
      | "bottom start"
      | "bottom end";
  };
export function ColorPickerPopover({
  children,
  xstyle,
  style,
  placement = "bottom start",
  side,
  align,
  sideOffset = 8,
  alignOffset,
  collisionPadding,
  collisionBoundary,
  ...props
}: ColorPickerPopoverProps) {
  const [placementSide, placementAlign] = placement.split(" ") as [
    "top" | "bottom" | "left" | "right",
    "start" | "end" | undefined,
  ];
  const compiled = stylex.props(
    materialStyles.root,
    styles.popover,
    materialStyles.accessible,
    xstyle,
  );
  return (
    <PopoverPortal>
      <Base.Positioner
        {...stylex.props(popoverStyles.positioner)}
        side={side ?? placementSide}
        align={align ?? placementAlign ?? "center"}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionBoundary={collisionBoundary}
      >
        <Base.Popup
          {...props}
          {...compiled}
          data-slot={props["data-slot"] ?? "color-picker-popover"}
          data-material="glass-medium"
          style={mergeStyle(compiled.style, style)}
        >
          <MaterialBackground variant="glass-medium" liveBackdrop />
          <div data-slot="color-picker-content" {...stylex.props(styles.content)}>
            {children}
          </div>
        </Base.Popup>
      </Base.Positioner>
    </PopoverPortal>
  );
}
export function ColorPickerDialog({
  render,
  ref,
  xstyle,
  style,
  ...props
}: StyleXProps<useRender.ComponentProps<"div">>) {
  const compiled = stylex.props(styles.dialog, xstyle);
  return (
    <Base.Title
      {...props}
      {...compiled}
      ref={ref}
      render={render ?? <div />}
      aria-label={props["aria-label"] ?? "Color picker"}
      data-slot={props["data-slot"] ?? "color-picker-dialog"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
