"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { emptyStateStyles } from "@lenso/tokens/empty-state";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
import type { ComponentProps } from "react";
export function EmptyStateRoot({ xstyle, style, ...props }: StyleXProps<ComponentProps<"div">>) {
  const compiled = stylex.props(emptyStateStyles.root, xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "empty-state"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export const EmptyState = Object.assign(EmptyStateRoot, { Root: EmptyStateRoot });
export type EmptyStateRootProps = ComponentProps<typeof EmptyStateRoot>;
export type EmptyStateProps = EmptyStateRootProps;
export type EmptyState = { Props: EmptyStateProps; RootProps: EmptyStateRootProps };
