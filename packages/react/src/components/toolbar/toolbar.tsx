"use client";

import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { toolbarStyles } from "@lenso/tokens/toolbar";
import {
  buttonStyles,
  buttonSizes,
  buttonVariants,
  buttonIconOnlySizes,
} from "@lenso/tokens/button";
import { linkStyles } from "@lenso/tokens/link";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { createContext, useContext, type ComponentProps } from "react";
import { ButtonSizeContext, type ButtonSize, type ButtonVariant } from "../button/button.js";
const Context = createContext<"horizontal" | "vertical">("horizontal");
function Button({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseToolbar.Button.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseToolbar.Button>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(buttonStyles.root, xstyle);
  return (
    <BaseToolbar.Button
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "toolbar-button"}
    />
  );
}
function Separator({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseToolbar.Separator.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseToolbar.Separator>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(toolbarStyles.separator, xstyle);
  return (
    <BaseToolbar.Separator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "toolbar-separator"}
    />
  );
}
export function ToolbarLink({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseToolbar.Link.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseToolbar.Link>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(linkStyles.root, xstyle);
  return (
    <BaseToolbar.Link
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "toolbar-link"}
    />
  );
}
export function ToolbarGroup({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseToolbar.Group.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseToolbar.Group>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(toolbarStyles.group, xstyle);
  return (
    <BaseToolbar.Group
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "toolbar-group"}
    />
  );
}
export type ToolbarRootProps = StyleXProps<ComponentProps<typeof BaseToolbar.Root>> & {
  "data-slot"?: unknown;
  isAttached?: boolean;
};
export function ToolbarRoot({
  isAttached = false,
  orientation = "horizontal",
  xstyle,
  style,
  ...props
}: ToolbarRootProps) {
  const compiled = stylex.props(
    toolbarStyles.root,
    orientation === "vertical" && toolbarStyles.vertical,
    isAttached && toolbarStyles.attached,
    xstyle,
  );
  return (
    <Context value={orientation}>
      <BaseToolbar.Root
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "toolbar"}
        orientation={orientation}
      />
    </Context>
  );
}
export type ToolbarButtonProps = ComponentProps<typeof Button> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
  isIconOnly?: boolean;
};
export function ToolbarButton({
  size = "md",
  variant = "primary",
  isIconOnly = false,
  xstyle,
  ...props
}: ToolbarButtonProps) {
  return (
    <ButtonSizeContext value={size}>
      <Button
        {...props}
        xstyle={[
          buttonSizes[size],
          buttonVariants[variant],
          isIconOnly && buttonIconOnlySizes[size],
          xstyle,
        ]}
      />
    </ButtonSizeContext>
  );
}
export function ToolbarSeparator({
  orientation: ownOrientation,
  xstyle,
  ...props
}: ComponentProps<typeof Separator>) {
  const toolbarOrientation = useContext(Context);
  const orientation =
    ownOrientation ?? (toolbarOrientation === "horizontal" ? "vertical" : "horizontal");
  return (
    <Separator
      {...props}
      orientation={orientation}
      xstyle={[
        toolbarStyles[orientation === "horizontal" ? "horizontalLine" : "verticalLine"],
        xstyle,
      ]}
    />
  );
}
export const Toolbar = Object.assign(ToolbarRoot, {
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Link: ToolbarLink,
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
});
