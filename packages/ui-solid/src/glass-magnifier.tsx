// Magnifier adaptation, Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
import { glassMotion } from "@lenso/glass/motion";
import { glassMagnifierStyles } from "@lenso/tokens/glass-magnifier";
import { createEffect, createSignal, omit } from "solid-js";
import { Glass, type GlassProps } from "./glass.jsx";

export type GlassMagnifierProps = Omit<GlassProps, "draggable"> & {
  draggable?: boolean;
  animated?: boolean;
};

export function GlassMagnifier(props: GlassMagnifierProps) {
  const [element, setElement] = createSignal<HTMLDivElement>();
  createEffect(
    () => [element(), props.draggable ?? true, props.animated ?? true] as const,
    ([node, draggable, animated]) => {
      return node ? glassMotion(node, draggable, animated) : undefined;
    },
  );
  return (
    <Glass
      {...omit(props, "ref", "xstyle", "draggable", "animated")}
      data-lenso-slot={String(props["data-lenso-slot"] ?? "glass-magnifier")}
      ref={[setElement, props.ref]}
      xstyle={[
        glassMagnifierStyles.root,
        props.draggable !== false && glassMagnifierStyles.draggable,
        props.xstyle,
      ]}
    />
  );
}
