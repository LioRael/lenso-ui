"use client";

import type { ComponentType, ReactNode } from "react";

export function LivePreview({
  Component,
  children,
}: {
  Component?: ComponentType;
  children?: ReactNode;
}) {
  return Component ? <Component /> : children;
}
