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
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import { createContext, useContext, type ComponentProps } from "react";
import { ButtonSizeContext, type ButtonSize, type ButtonVariant } from "../button/button.js";
const Root = styledPart(BaseToolbar.Root, "toolbar", toolbarStyles.root);
const Context = createContext<"horizontal" | "vertical">("horizontal");
const Button = styledPart(BaseToolbar.Button, "toolbar-button", buttonStyles.root);
const Separator = styledPart(BaseToolbar.Separator, "toolbar-separator", toolbarStyles.separator);
export const ToolbarLink = styledPart(BaseToolbar.Link, "toolbar-link", linkStyles.root);
export const ToolbarGroup = styledPart(BaseToolbar.Group, "toolbar-group", toolbarStyles.group);
export type ToolbarRootProps = StyleXProps<ComponentProps<typeof BaseToolbar.Root>> & {
  isAttached?: boolean;
};
export function ToolbarRoot({
  isAttached = false,
  orientation = "horizontal",
  xstyle,
  ...props
}: ToolbarRootProps) {
  return (
    <Context value={orientation}>
      <Root
        {...props}
        orientation={orientation}
        xstyle={[
          orientation === "vertical" && toolbarStyles.vertical,
          isAttached && toolbarStyles.attached,
          xstyle,
        ]}
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
