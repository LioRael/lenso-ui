"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { emptyStateStyles } from "@lenso/tokens/empty-state";
import { styledPart } from "../../utils/styled.js";
import type { ComponentProps } from "react";
export const EmptyStateRoot = styledPart("div", "empty-state", emptyStateStyles.root);
export const EmptyState = Object.assign(EmptyStateRoot, { Root: EmptyStateRoot });
export type EmptyStateRootProps = ComponentProps<typeof EmptyStateRoot>;
export type EmptyStateProps = EmptyStateRootProps;
export type EmptyState = { Props: EmptyStateProps; RootProps: EmptyStateRootProps };
