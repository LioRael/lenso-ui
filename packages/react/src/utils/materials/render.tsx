"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as stylex from "@stylexjs/stylex";
import { useGlassRef } from "@lenso/glass/react";
import { paintMaterialBackdrop } from "@lenso/glass";
import {
  liquidMaterialStyles,
  materialStyles,
  type MaterialVariant,
} from "@lenso/tokens/materials";

/** Internal decoration; the caller retains its native root and layout. */
export function MaterialBackground({
  variant,
  sourceAnchor,
  liveBackdrop = false,
  liveGeometry = false,
  local = false,
}: {
  variant: MaterialVariant;
  sourceAnchor?: RefObject<HTMLElement | null>;
  liveBackdrop?: boolean;
  liveGeometry?: boolean;
  /** Keep paints inside a nonrectangular clipped shape. */
  local?: boolean;
}) {
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
          )}
        />
      )}
      {!liquid && !opaque && (
        <>
          {[materialStyles.blur, materialStyles.upper, materialStyles.lower].map((paint, index) => (
            <span
              key={index}
              aria-hidden="true"
              {...stylex.props(materialStyles.layer, materialStyles.fallback, paint)}
            />
          ))}
        </>
      )}
    </>
  );
}
