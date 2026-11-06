"use client";

import type { ComponentProps } from "react";
import { Button } from "@lenso/ui/button";
import { useGlassRef } from "@lenso/glass/react";
import {
  glassButtonIconOnlySizes,
  glassButtonSizes,
  glassButtonStyles,
  glassButtonVariants,
} from "@lenso/tokens/glass-button";
import { liquidMaterialStyles } from "@lenso/tokens/materials";

type Props = Omit<ComponentProps<typeof Button>, "variant"> & { variant?: "default" };

export function DocumentationButton({
  ref,
  size = "sm",
  isIconOnly = false,
  xstyle,
  variant = "default",
  ...props
}: Props) {
  const glass = useGlassRef<HTMLElement>(ref, true);
  return (
    <Button
      {...props}
      ref={glass}
      size={size}
      variant="ghost"
      isIconOnly={isIconOnly}
      xstyle={[
        glassButtonStyles.root,
        liquidMaterialStyles.small,
        glassButtonSizes[size],
        glassButtonVariants[variant],
        isIconOnly && glassButtonStyles.iconOnly,
        isIconOnly && glassButtonIconOnlySizes[size],
        xstyle,
      ]}
    />
  );
}
