"use client";
// Modified: UI SDK owns the popover, focus restoration and render composition.
import { isValidElement, type ComponentPropsWithRef, type ReactNode } from "react";
import * as SdkPopover from "@ui-sdk/react/popover";
import { slotRender } from "../../utils/sdk-render.js";
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
import { ColorScope, type ColorScopeProps, type ColorValue } from "../../utils/color-state.js";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";

export type ColorPickerRootProps = StyleXProps<Omit<ColorScopeProps, "children" | "className">> &
  Pick<
    React.ComponentProps<typeof SdkPopover.Popover>,
    "open" | "defaultOpen" | "onOpenChange" | "onOpenChangeComplete" | "modal"
  > & {
    children?: ReactNode | ((state: ColorValue) => ReactNode);
  };
export function ColorPickerRoot({
  children,
  open,
  defaultOpen,
  onOpenChange,
  onOpenChangeComplete,
  modal,
  xstyle,
  style,
  render,
  ...props
}: ColorPickerRootProps) {
  const compiled = stylex.props(styles.root, xstyle);
  return (
    <ColorScope
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "color-picker", render)}
    >
      {(scope) => (
        <SdkPopover.Popover
          open={open}
          defaultOpen={defaultOpen}
          onOpenChange={onOpenChange}
          onOpenChangeComplete={onOpenChangeComplete}
          modal={modal}
        >
          {typeof children === "function" ? children(scope) : children}
        </SdkPopover.Popover>
      )}
    </ColorScope>
  );
}
export type ColorPickerTriggerProps = StyleXProps<
  ComponentPropsWithRef<typeof SdkPopover.PopoverTrigger>
>;
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
    <SdkPopover.PopoverTrigger
      {...props}
      {...compiled}

      ref={glassRef}
      render={slotRender("button", props["data-lenso-slot"] ?? "color-picker-trigger", render)}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export type ColorPickerPopoverProps = StyleXProps<
  ComponentPropsWithRef<typeof SdkPopover.PopoverContent>
>;
export function ColorPickerPopover({
  children,
  xstyle,
  style,
  side = "bottom",
  align = "start",
  sideOffset = 8,
  alignOffset,
  collisionPadding,
  ...props
}: ColorPickerPopoverProps) {
  const compiled = stylex.props(
    materialStyles.root,
    materialStyles.accessible,
    popoverStyles.positioner,
    styles.popover,
    xstyle,
  );
  return (
    <SdkPopover.PopoverContent
      side={side}
      align={align}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}

      {...props}
      {...compiled}
      aria-label={props["aria-label"] ?? "Color picker"}
      render={slotRender("div", props["data-lenso-slot"] ?? "color-picker-popover", props.render)}
      data-material="glass-medium"
      style={mergeStyle(compiled.style, style)}
    >
      {(state) => (
        <>
          <MaterialBackground variant="glass-medium" liveBackdrop />
          <div data-lenso-slot="color-picker-content" {...stylex.props(styles.content)}>
            {typeof children === "function" ? children(state) : children}
          </div>
        </>
      )}
    </SdkPopover.PopoverContent>
  );
}
