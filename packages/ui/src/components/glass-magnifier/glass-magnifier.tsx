"use client";
// Magnifier adaptation, Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: optical surface composition and native ref cleanup.
import { useCallback, useEffect, useState } from "react";
import { glassMagnifierStyles } from "@lenso/tokens/glass-magnifier";
import { Glass, type GlassProps } from "../glass/index.js";
import { glassMotion } from "@lenso/glass/motion";
import { assignRef } from "../../utils/interaction/ref.js";

export type GlassMagnifierProps = Omit<GlassProps, "draggable"> & {
  /** Move the lens within its parent's bounds using pointer capture. */
  draggable?: boolean;
  /** Enable lift, velocity deformation and shadow springs. */
  animated?: boolean;
};

export function GlassMagnifier({
  ref,
  xstyle,
  draggable = true,
  animated = true,
  ...props
}: GlassMagnifierProps) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useEffect(
    () => (element ? glassMotion(element, draggable, animated) : undefined),
    [element, draggable, animated],
  );
  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
  return (
    <Glass
      {...props}
      ref={combinedRef}
      data-lenso-slot={props["data-lenso-slot"] ?? "glass-magnifier"}
      xstyle={[glassMagnifierStyles.root, draggable && glassMagnifierStyles.draggable, xstyle]}
    />
  );
}
