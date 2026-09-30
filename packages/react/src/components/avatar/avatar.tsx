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
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import { AvatarGroupContext } from "../avatar-group/avatar-group-context.js";
type Appearance = {
  size: keyof typeof avatarSizes;
  color: keyof typeof avatarColors;
  variant: "default" | "soft";
};
const Context = createContext<Appearance>({ size: "md", color: "default", variant: "default" });
const Root = styledPart(Primitive.Root, "avatar", avatarStyles.root);
const Fallback = styledPart(Primitive.Fallback, "avatar-fallback", avatarStyles.fallback);
export type AvatarRootProps = StyleXProps<ComponentProps<typeof Primitive.Root>> &
  Partial<Appearance>;
export function AvatarRoot({ size, color, variant, xstyle, ...props }: AvatarRootProps) {
  const group = useContext(AvatarGroupContext);
  const appearance: Appearance = {
    size: size ?? group.size ?? "md",
    color: color ?? group.color ?? "default",
    variant: variant ?? group.variant ?? "default",
  };
  return (
    <Context.Provider value={appearance}>
      <Root
        {...props}
        xstyle={[
          avatarSizes[appearance.size],
          appearance.variant === "soft" && avatarStyles.soft,
          xstyle,
        ]}
      />
    </Context.Provider>
  );
}
export function AvatarFallback({
  xstyle,
  color: colorProp,
  ...props
}: ComponentProps<typeof Fallback> & { color?: keyof typeof avatarColors }) {
  const { size, color: rootColor, variant } = useContext(Context);
  const color = colorProp ?? rootColor;
  const group = useContext(AvatarGroupContext);
  return (
    <Fallback
      {...props}
      xstyle={[
        avatarFallbackSizes[size],
        avatarColors[color],
        variant === "soft" && avatarSoft[color],
        group.clipped && avatarStyles.clippedFallback,
        xstyle,
      ]}
    />
  );
}
export const AvatarImage = styledPart(Primitive.Image, "avatar-image", avatarStyles.image);
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
