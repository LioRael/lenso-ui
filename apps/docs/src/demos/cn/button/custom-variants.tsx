// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0. Variant composition uses StyleX, not tailwind-variants.
import { Button, type ButtonRootProps } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/button/source.stylex";
const radii = stylex.create({
  full: {
    borderRadius: 9999,
  },
  lg: {
    borderRadius: 8,
  },
  md: {
    borderRadius: 6,
  },
  sm: {
    borderRadius: 2,
  },
});
const sizes = stylex.create({
  sm: {
    height: 40,
    paddingInline: 16,
  },
  md: {
    height: 44,
    paddingInline: 24,
  },
  lg: {
    height: 48,
    paddingInline: 32,
  },
  xl: {
    height: 52,
    paddingInline: 40,
  },
});
type CustomButtonProps = Omit<ButtonRootProps, "size"> & {
  size?: keyof typeof sizes;
  radius?: keyof typeof radii;
};
function CustomButton({ radius = "full", size = "md", xstyle, ...props }: CustomButtonProps) {
  return <Button {...props} xstyle={[styles.custom, radii[radius], sizes[size], xstyle]} />;
}
export function CustomVariants() {
  return <CustomButton>自定义按钮</CustomButton>;
}
