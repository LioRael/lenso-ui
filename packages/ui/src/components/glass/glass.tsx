"use client";
// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: Base UI native render composition and ref cleanup.
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import { glassStyles } from "@lenso/tokens/glass";
import * as stylex from "@stylexjs/stylex";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type GlassProps = StyleXProps<useRender.ComponentProps<"div">> & {
  "data-slot"?: unknown;
  /** Enable shared press enlargement and elastic return on this element. */
  elastic?: boolean;
};
export function Glass({ ref, render, xstyle, style, elastic = false, ...props }: GlassProps) {
  const glassRef = useElasticRef(useGlassRef(ref, true, false, "glass-small"), {
    enabled: elastic,
  });
  const compiled = stylex.props(
    glassStyles.root,
    glassStyles.optics,
    glassStyles.foreground,
    glassStyles.hotspot,
    elastic && glassStyles.elastic,
    xstyle,
  );
  return useRender({
    defaultTagName: "div",
    render,
    ref: glassRef,
    props: mergeProps(compiled, props, {
      style: mergeStyle(compiled.style, style),
      "data-slot": props["data-slot"] ?? "glass",
    }),
  });
}
