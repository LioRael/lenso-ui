"use client";

import { Heart } from "@gravity-ui/icons";
import { GlassToggleButton } from "@lenso/ui";
import type { ComponentProps } from "react";

export type GlassToggleButtonStoryProps = Pick<
  ComponentProps<typeof GlassToggleButton>,
  "disabled" | "defaultPressed" | "size" | "variant" | "elastic" | "isIconOnly"
>;

export function GlassToggleButtonStory({ isIconOnly, ...props }: GlassToggleButtonStoryProps) {
  return (
    <GlassToggleButton
      {...props}
      isIconOnly={isIconOnly}
      aria-label={isIconOnly ? "Like" : undefined}
      icon={<Heart />}
    >
      {isIconOnly ? undefined : "Like"}
    </GlassToggleButton>
  );
}
