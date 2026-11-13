"use client";
// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: UI SDK render composition and ref cleanup.
import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import { glassStyles } from "@lenso/tokens/glass";
import * as stylex from "@stylexjs/stylex";
import { useElasticRef, useGlassRef } from "@lenso/glass/react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type GlassProps = StyleXProps<PartProps<"div">> & {
  "data-lenso-slot"?: unknown;
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
  return renderElement(
    "div",
    {
      ...mergeProps(compiled, props, {
        style: mergeStyle(compiled.style, style),
        "data-lenso-slot": props["data-lenso-slot"] ?? "glass",
      }),
      ref: glassRef,
    },
    render,
  );
}
