"use client";

import { type ComponentProps } from "react";
import { useRender } from "@base-ui/react/use-render";
import { linkStyles } from "@lenso/tokens/link";
import { styledPart } from "../../utils/styled.js";
function NativeLink({ render, ref, ...props }: useRender.ComponentProps<"a">) {
  return useRender({ defaultTagName: "a", render, ref, props });
}
const Root = styledPart(NativeLink, "link", linkStyles.root);
const Icon = styledPart("span", "link-icon", linkStyles.icon);
export type LinkRootProps = ComponentProps<typeof Root> & { disabled?: boolean };
export function LinkRoot({
  disabled = false,
  href,
  role,
  render,
  onClickCapture,
  onKeyDownCapture,
  tabIndex,
  ...props
}: LinkRootProps) {
  return (
    <Root
      {...props}
      render={render}
      href={disabled ? undefined : href}
      role={role ?? (disabled && !render ? "link" : undefined)}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      onClickCapture={(event) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClickCapture?.(event);
      }}
      onKeyDownCapture={(event) => {
        if (disabled && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onKeyDownCapture?.(event);
      }}
    />
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
