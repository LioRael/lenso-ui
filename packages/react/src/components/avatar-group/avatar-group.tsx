"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML, Base UI and StyleX.
import {
  Children,
  cloneElement,
  isValidElement,
  type ComponentProps,
  type ReactElement,
} from "react";
import { avatarGroupStyles } from "@lenso/tokens/avatar-group";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
import { Avatar, type AvatarRootProps } from "../avatar/avatar.js";
import { AvatarGroupContext, type AvatarGroupAppearance } from "./avatar-group-context.js";
export type AvatarGroupRootProps = StyleXProps<ComponentProps<"div">> &
  AvatarGroupAppearance & { isGrid?: boolean; max?: number; overlap?: "clip" | "ring" };
export type AvatarGroupCountProps = AvatarRootProps;
export function AvatarGroupCount({ children, xstyle, ...props }: AvatarGroupCountProps) {
  return (
    <Avatar data-slot="avatar-group-count" {...props} xstyle={[avatarGroupStyles.count, xstyle]}>
      <Avatar.Fallback>{children}</Avatar.Fallback>
    </Avatar>
  );
}
export function AvatarGroupRoot({
  children,
  size = "md",
  color,
  variant,
  isGrid = false,
  max,
  overlap = "clip",
  xstyle,
  style,
  ...props
}: AvatarGroupRootProps) {
  const compiled = stylex.props(avatarGroupStyles.root, isGrid && avatarGroupStyles.grid, xstyle);
  const elements = Children.toArray(children).filter(
    isValidElement,
  ) as ReactElement<AvatarRootProps>[];
  const avatars = elements.filter((child) => child.type !== AvatarGroupCount);
  const counts = elements.filter((child) => child.type === AvatarGroupCount);
  const visible = max === undefined ? avatars : avatars.slice(0, Math.max(0, max));
  const remaining = avatars.length - visible.length;
  const all = [
    ...visible,
    ...(counts.length
      ? counts
      : remaining > 0
        ? [<AvatarGroupCount key="count">+{remaining}</AvatarGroupCount>]
        : []),
  ];
  const appearance = {
    size,
    ...(color === undefined ? {} : { color }),
    ...(variant === undefined ? {} : { variant }),
  };
  return (
    <AvatarGroupContext.Provider value={appearance}>
      <div
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "avatar-group"}
        {...compiled}
        style={{ ...compiled.style, ...style }}
      >
        {all.map((child, index) => {
          const clipped =
            !isGrid &&
            overlap === "clip" &&
            index < all.length - 1 &&
            child.type !== AvatarGroupCount;
          return (
            <AvatarGroupContext.Provider key={child.key} value={{ ...appearance, clipped }}>
              {cloneElement(child, {
                xstyle: [
                  !isGrid && index > 0 && avatarGroupStyles.overlap,
                  !isGrid && overlap === "ring" && avatarGroupStyles.ring,
                  clipped && avatarGroupStyles.clip,
                  child.props.xstyle,
                ],
              })}
            </AvatarGroupContext.Provider>
          );
        })}
      </div>
    </AvatarGroupContext.Provider>
  );
}
export const AvatarGroup = Object.assign(AvatarGroupRoot, {
  Root: AvatarGroupRoot,
  Count: AvatarGroupCount,
});
export type AvatarGroupProps = AvatarGroupRootProps;
export type AvatarGroup = {
  Props: AvatarGroupProps;
  RootProps: AvatarGroupRootProps;
  CountProps: AvatarGroupCountProps;
};
