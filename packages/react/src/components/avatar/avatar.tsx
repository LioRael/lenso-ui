"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for Base UI and StyleX.
import { Avatar as Primitive } from "@base-ui/react/avatar";
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
export type AvatarRootProps = StyleXProps<Primitive.Root.Props> & Partial<Appearance>;
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
      <Primitive.Root
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "avatar"}
        {...compiled}
        style={mergeStyle<Primitive.Root.State>(compiled.style, style)}
      />
    </Context.Provider>
  );
}
export function AvatarFallback({
  xstyle,
  style,
  color: colorProp,
  ...props
}: StyleXProps<Primitive.Fallback.Props> & { color?: keyof typeof avatarColors }) {
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
    <Primitive.Fallback
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "avatar-fallback"}
      {...compiled}
      style={mergeStyle<Primitive.Fallback.State>(compiled.style, style)}
    />
  );
}
export function AvatarImage({ xstyle, style, ...props }: StyleXProps<Primitive.Image.Props>) {
  const compiled = stylex.props(avatarStyles.image, xstyle);
  return (
    <Primitive.Image
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "avatar-image"}
      {...compiled}
      style={mergeStyle<Primitive.Image.State>(compiled.style, style)}
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
