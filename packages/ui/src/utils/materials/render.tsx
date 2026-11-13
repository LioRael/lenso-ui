"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { renderElement, type PartProps } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import { liquidMaterialStyles, materialStyles, vibrantStyles } from "@lenso/tokens/materials";
import * as stylex from "@stylexjs/stylex";
import { GlassFusionContext, useGlassRef } from "@lenso/glass/react";
import { paintMaterialBackdrop } from "@lenso/glass";
import { mergeStyle, type StyleXProps, type XStyle } from "../styled.js";

import { useScrollEdgeRef, type ScrollEdgeSide } from "./scroll-edge.js";

import {
  createSoftEdgeTintMask,
  softEdgeBands,
  softEdgeMask,
  softEdgeTintMask,
} from "./soft-edge.js";

import type { MaterialVariant } from "@lenso/tokens/materials";
export type MaterialProps = StyleXProps<PartProps<"div">> & {
  variant?: MaterialVariant;
  liveGeometry?: boolean;
  deferOptics?: boolean;
};
/** A material surface. Geometry and interactive behavior belong to its consumer. */
export function Material({
  variant = "regular",
  liveGeometry = false,
  deferOptics = false,
  children,
  ref,
  render,
  xstyle,
  style,
  ...props
}: MaterialProps) {
  const liquid = variant.startsWith("glass-");
  const compiled = stylex.props(
    materialStyles.root,
    !liquid && materialStyles[variant as "ultrathin" | "thin" | "regular" | "thick" | "chrome"],
    materialStyles.accessible,
    xstyle,
  );
  return renderElement(
    "div",
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs without reading them during render.
    {
      ...mergeProps(compiled, props, {
        "data-lenso-slot": props["data-lenso-slot"] ?? "material",
        "data-material": variant,
        style: mergeStyle(compiled.style, style),
        children: (
          <>
            <MaterialBackground
              variant={variant}
              liveGeometry={liveGeometry}
              deferOptics={deferOptics}
            />
            {children}
          </>
        ),
      }),
      ref: ref,
    },
    render,
  );
}
type MaterialBackgroundProps = {
  variant: MaterialVariant;
  layerXstyle?: XStyle;
  sourceAnchor?: RefObject<HTMLElement | null>;
  liveBackdrop?: boolean;
  liveGeometry?: boolean;
  /** The surface owns data-material-resting; moving glass uses native blur and a CSS edge. */
  deferOptics?: boolean;
  /** Keep paints inside a nonrectangular clipped shape. */
  local?: boolean;
};
/** Decoration owns its optics independently of an ancestor's interactive glass group. */
export function MaterialBackground(props: MaterialBackgroundProps) {
  return (
    <GlassFusionContext value={null}>
      <MaterialBackgroundPaint {...props} />
    </GlassFusionContext>
  );
}
function MaterialBackgroundPaint({
  variant,
  sourceAnchor,
  liveBackdrop = false,
  liveGeometry = false,
  deferOptics = false,
  local = false,
  layerXstyle,
}: MaterialBackgroundProps) {
  const [opaque, setOpaque] = useState(false);
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const surface = marker.current?.parentElement;
    const reduced = matchMedia("(prefers-reduced-transparency: reduce), (forced-colors: active)");
    const contrast = matchMedia("(prefers-contrast: more)");
    const update = () => {
      const explicit = surface?.closest("[data-contrast]")?.getAttribute("data-contrast");
      const next = reduced.matches || explicit === "increased" || contrast.matches;
      setOpaque(next);
      surface?.toggleAttribute("data-material-opaque", next);
    };
    update();
    const observer = new MutationObserver(update);
    for (let node = surface; node; node = node.parentElement)
      observer.observe(node, { attributes: true, attributeFilter: ["data-contrast"] });
    reduced.addEventListener("change", update);
    contrast.addEventListener("change", update);
    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", update);
      contrast.removeEventListener("change", update);
      surface?.removeAttribute("data-material-opaque");
    };
  }, []);
  const liquid = variant.startsWith("glass-");
  useEffect(() => {
    const surface = marker.current?.parentElement;
    if (surface && !liquid && !opaque && !local) return paintMaterialBackdrop(surface);
  }, [variant, liquid, opaque, local]);
  const glassRef = useGlassRef<HTMLSpanElement>(
    undefined,
    liquid && !opaque,
    false,
    variant,
    sourceAnchor,
    liveBackdrop,
    liveGeometry,
    deferOptics,
  );
  const panel = variant === "glass-medium" || variant === "glass-large";
  return (
    <>
      <span hidden aria-hidden="true" ref={marker} />
      {liquid && !opaque && (
        <span
          ref={glassRef}
          aria-hidden="true"
          data-material-lens=""
          {...stylex.props(
            materialStyles.layer,
            liquidMaterialStyles.small,
            liveBackdrop && liquidMaterialStyles.menu,
            panel && liquidMaterialStyles.medium,
            variant === "glass-large" && liquidMaterialStyles.large,
            variant === "glass-clear" && liquidMaterialStyles.clear,
            deferOptics && panel && liquidMaterialStyles.menuMoving,
            layerXstyle,
          )}
        />
      )}
      {!liquid && !opaque && (
        <>
          {[materialStyles.blur, materialStyles.upper, materialStyles.lower].map((paint, index) => (
            <span
              key={index}
              aria-hidden="true"
              {...stylex.props(materialStyles.layer, materialStyles.fallback, paint, layerXstyle)}
            />
          ))}
        </>
      )}
    </>
  );
}
export type ScrollEdgeProps = StyleXProps<PartProps<"div">> & {
  variant?: "soft" | "hard";
  edge?: ScrollEdgeSide;
  /** Bind to the viewport to reveal only the edges with content beyond them. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Keep the soft backdrop at full strength through this many pixels before it fades. */
  fadeStart?: number;
};
/** Decorative overlay; position inside a bounded scroll viewport, outside scrolling content. */
export function ScrollEdge({
  variant = "soft",
  edge = "top",
  scrollRef,
  fadeStart = 0,
  ref,
  render,
  xstyle,
  style,
  ...props
}: ScrollEdgeProps) {
  const edgeRef = useScrollEdgeRef(ref, scrollRef, edge);
  const compiled = stylex.props(
    materialStyles.edge,
    variant === "soft" && materialStyles.soft,
    variant === "hard" && materialStyles.hard,
    variant === "hard" &&
      {
        top: materialStyles.hardTop,
        bottom: materialStyles.hardBottom,
        "inline-start": materialStyles.hardInlineStart,
        "inline-end": materialStyles.hardInlineEnd,
      }[edge],
    materialStyles[edge],
    materialStyles.edgeAccessible,
    xstyle,
  );
  return renderElement(
    "div",
    {
      ...mergeProps(compiled, props, {
        "aria-hidden": true,
        "data-lenso-slot": "scroll-edge",
        "data-scroll-bound": scrollRef ? "" : undefined,
        "data-edge": edge,
        "data-variant": variant,
        style: mergeStyle(compiled.style, style),
        children:
          variant === "soft" ? (
            <>
              {softEdgeBands.map(({ blur, mask, start, end }) => (
                <span
                  key={blur}
                  {...stylex.props(
                    materialStyles.softLayer,
                    materialStyles.softProgressive(
                      blur,
                      fadeStart ? softEdgeMask(start, end, 1, fadeStart) : mask,
                    ),
                  )}
                />
              ))}
              <span
                {...stylex.props(
                  materialStyles.softLayer,
                  materialStyles.softTint,
                  materialStyles.softMask(
                    fadeStart ? createSoftEdgeTintMask(fadeStart) : softEdgeTintMask,
                  ),
                )}
              />
            </>
          ) : (
            props.children
          ),
      }),
      ref: edgeRef,
    },
    render,
  );
}

export type MaterialLabelProps = Omit<StyleXProps<PartProps<"span">>, "children"> & {
  children: string;
  tone?: "primary" | "secondary" | "tertiary" | "quaternary";
};
/** Plain text only: the second paint is hidden from accessibility and text selection. */
export function MaterialLabel({
  children,
  tone = "primary",
  ref,
  render,
  xstyle,
  style,
  ...props
}: MaterialLabelProps) {
  const compiled = stylex.props(vibrantStyles.label, vibrantStyles[tone], xstyle);
  return renderElement(
    "span",
    // oxlint-disable-next-line react/refs -- SDK renderElement forwards refs without reading them during render.
    {
      ...mergeProps(compiled, props, {
        "data-lenso-slot": "material-label",
        style: mergeStyle(compiled.style, style),
        children: (
          <>
            <span {...stylex.props(vibrantStyles.text, vibrantStyles.lowerText)}>{children}</span>
            <span aria-hidden="true" {...stylex.props(vibrantStyles.text, vibrantStyles.upperText)}>
              {children}
            </span>
          </>
        ),
      }),
      ref: ref,
    },
    render,
  );
}
export type MaterialFillProps = Omit<StyleXProps<PartProps<"span">>, "children"> & {
  tone?: "primary" | "secondary" | "tertiary" | "separator";
};
export function MaterialFill({
  tone = "primary",
  ref,
  render,
  xstyle,
  style,
  ...props
}: MaterialFillProps) {
  const compiled = stylex.props(
    vibrantStyles.fill,
    tone === "separator" ? vibrantStyles.separator : vibrantStyles[`${tone}Fill`],
    xstyle,
  );
  return renderElement(
    "span",
    {
      ...mergeProps(compiled, props, {
        "aria-hidden": true,
        "data-lenso-slot": "material-fill",
        style: mergeStyle(compiled.style, style),
      }),
      ref: ref,
    },
    render,
  );
}
