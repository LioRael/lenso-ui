"use client";

import { closeButtonStyles } from "@lenso/tokens/close-button";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { ButtonRoot, type ButtonRootProps } from "../button/button.js";
function Icon({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"svg">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(closeButtonStyles.icon, xstyle);
  return (
    <svg
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "close-button-icon"}
    />
  );
}
export type CloseButtonRootProps = Omit<
  ButtonRootProps,
  "size" | "variant" | "isIconOnly" | "fullWidth"
>;
export function CloseButtonRoot({ children, xstyle, ...props }: CloseButtonRootProps) {
  return (
    <ButtonRoot
      aria-label="Close"
      {...props}
      data-slot="close-button"
      xstyle={[closeButtonStyles.root, xstyle]}
    >
      {children ?? (
        <Icon viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="m4 4 8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Icon>
      )}
    </ButtonRoot>
  );
}
export const CloseButton = Object.assign(CloseButtonRoot, { Root: CloseButtonRoot });
