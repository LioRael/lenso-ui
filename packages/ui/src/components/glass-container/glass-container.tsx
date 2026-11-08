"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  GlassFusionContext,
  attachFusion,
  glassIsOpaque,
  observeGlassPreferences,
  type FusionGroup,
} from "@lenso/glass/react";
import { glassContainerStyles } from "@lenso/tokens/glass-container";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { Glass } from "../glass/glass.js";

export type GlassContainerProps = StyleXProps<useRender.ComponentProps<"div">> & {
  /** Smooth-union blend radius in CSS px. Default: 20. */
  spacing?: number;
  /** Disable the connecting bridges. */
  disabled?: boolean;
  /** Tint the connecting bridge without changing member materials. */
  tint?: string;
};

function Container({
  spacing = 20,
  disabled = false,
  tint,
  ref,
  render,
  children,
  xstyle,
  style,
  ...props
}: GlassContainerProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [surface, setSurface] = useState<HTMLDivElement | null>(null);
  const [opaque, setOpaque] = useState(false);
  const group = useMemo<FusionGroup>(() => ({ members: new Set(), update: () => {} }), []);
  useEffect(() => {
    if (element) return observeGlassPreferences(element, () => setOpaque(glassIsOpaque(element)));
  }, [element]);
  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      if (typeof ref === "function") {
        const cleanup = ref(node);
        return () => {
          if (cleanup) cleanup();
          else ref(null);
        };
      }
      if (ref) ref.current = node;
      return () => {
        if (ref) ref.current = null;
      };
    },
    [ref],
  );
  useEffect(() => {
    if (element && surface && !disabled && !opaque)
      return attachFusion(
        element,
        surface,
        group,
        Math.max(0, Number.isFinite(spacing) ? spacing : 20),
      );
  }, [element, surface, group, spacing, disabled, opaque]);
  const compiled = stylex.props(
    glassContainerStyles.root,
    tint !== undefined && glassContainerStyles.tint(tint),
    xstyle,
  );
  const result = useRender({
    defaultTagName: "div",
    render,
    ref: containerRef,
    props: mergeProps(compiled, props, {
      style: mergeStyle(compiled.style, style),
      "data-slot": props["data-slot"] ?? "glass-container",
      children: (
        <>
          {children}
          <div
            {...stylex.props(glassContainerStyles.surface)}
            ref={setSurface}
            aria-hidden="true"
            data-lenso-glass-fusion=""
            hidden
          >
            <div {...stylex.props(glassContainerStyles.rim)} />
          </div>
        </>
      ),
    }),
  });
  return (
    <GlassFusionContext value={disabled || opaque ? null : group}>{result}</GlassFusionContext>
  );
}

export const GlassContainer = Object.assign(Container, { Item: Glass });
