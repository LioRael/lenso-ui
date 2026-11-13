"use client";

import { type ComponentProps } from "react";
import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { linkStyles } from "@lenso/tokens/link";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
function Icon({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(linkStyles.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "link-icon"}
    />
  );
}
export type LinkRootProps = StyleXProps<PartProps<"a">> & {
  "data-lenso-slot"?: unknown;
  disabled?: boolean;
};
export function LinkRoot({
  disabled = false,
  href,
  role,
  render,
  onClickCapture,
  onKeyDownCapture,
  tabIndex,
  ref,
  xstyle,
  style,
  ...props
}: LinkRootProps) {
  const compiled = stylex.props(linkStyles.root, xstyle);
  return renderElement(
    "a",
    {
      ...{
        ...props,
        ...compiled,
        style: mergeStyle(compiled.style, style),
        "data-lenso-slot": props["data-lenso-slot"] ?? "link",
        href: disabled ? undefined : href,
        role: role ?? (disabled && !render ? "link" : undefined),
        "aria-disabled": disabled || undefined,
        tabIndex: disabled ? -1 : tabIndex,
        onClickCapture: (event: React.MouseEvent<HTMLAnchorElement>) => {
          if (disabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onClickCapture?.(event);
        },
        onKeyDownCapture: (event: React.KeyboardEvent<HTMLAnchorElement>) => {
          if (disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          onKeyDownCapture?.(event);
        },
      },
      ref: ref,
    },
    render,
  );
}
export type LinkIconProps = ComponentProps<typeof Icon>;
export function LinkIcon({ children, xstyle, ...props }: LinkIconProps) {
  return (
    <Icon
      aria-hidden="true"
      {...props}
      data-default-icon={!children || undefined}
      xstyle={[!children && linkStyles.defaultIcon, xstyle]}
    >
      {children ?? (
        <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
          <path
            d="M5 3h8v8M13 3 3 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Icon>
  );
}
export const Link = Object.assign(LinkRoot, { Root: LinkRoot, Icon: LinkIcon });
