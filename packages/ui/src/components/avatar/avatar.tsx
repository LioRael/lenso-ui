"use client";
import * as Primitive from "@ui-sdk/react/avatar";
import { slotRender } from "../../utils/sdk-render.js";
import { createContext, useContext, type ComponentProps } from "react";
import {
  avatarStyles,
  avatarSizes,
  avatarFallbackSizes,
  avatarColors,
  avatarSoft,
} from "@lenso/tokens/avatar";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { AvatarGroupContext } from "../avatar-group/avatar-group-context.js";
type Appearance = {
  size: keyof typeof avatarSizes;
  color: keyof typeof avatarColors;
  variant: "default" | "soft";
};
const Context = createContext<Appearance>({ size: "md", color: "default", variant: "default" });
export type AvatarRootProps = StyleXProps<ComponentProps<typeof Primitive.Avatar>> &
  Partial<Appearance>;
export function AvatarRoot({ size, color, variant, xstyle, style, ...props }: AvatarRootProps) {
  const group = useContext(AvatarGroupContext);
  const appearance: Appearance = {
    size: size ?? group.size ?? "md",
    color: color ?? group.color ?? "default",
    variant: variant ?? group.variant ?? "default",
  };
  const compiled = stylex.props(
    avatarStyles.root,
    avatarSizes[appearance.size],
    appearance.variant === "soft" && avatarStyles.soft,
    xstyle,
  );
  return (
    <Context.Provider value={appearance}>
      <Primitive.Avatar
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "avatar"}
        render={slotRender("span", props["data-slot"] ?? "avatar", props.render)}
        {...compiled}
        style={mergeStyle<Primitive.AvatarState>(compiled.style, style)}
      />
    </Context.Provider>
  );
}
export function AvatarFallback({
  xstyle,
  style,
  color: colorProp,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.AvatarFallback>> & {
  color?: keyof typeof avatarColors;
}) {
  const { size, color: rootColor, variant } = useContext(Context);
  const color = colorProp ?? rootColor;
  const group = useContext(AvatarGroupContext);
  const compiled = stylex.props(
    avatarStyles.fallback,
    avatarFallbackSizes[size],
    avatarColors[color],
    variant === "soft" && avatarSoft[color],
    group.clipped && avatarStyles.clippedFallback,
    xstyle,
  );
  return (
    <Primitive.AvatarFallback
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "avatar-fallback"}
      render={slotRender("span", props["data-slot"] ?? "avatar-fallback", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.AvatarState>(compiled.style, style)}
    />
  );
}
export function AvatarImage({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentProps<typeof Primitive.AvatarImage>>) {
  const compiled = stylex.props(avatarStyles.image, xstyle);
  return (
    <Primitive.AvatarImage
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "avatar-image"}
      render={slotRender("img", props["data-slot"] ?? "avatar-image", props.render)}
      {...compiled}
      style={mergeStyle<Primitive.AvatarState>(compiled.style, style)}
    />
  );
}
export const Avatar = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
export type AvatarProps = AvatarRootProps;
export type AvatarImageProps = ComponentProps<typeof AvatarImage>;
export type AvatarFallbackProps = ComponentProps<typeof AvatarFallback>;
export type Avatar = {
  Props: AvatarProps;
  RootProps: AvatarRootProps;
  ImageProps: AvatarImageProps;
  FallbackProps: AvatarFallbackProps;
};
