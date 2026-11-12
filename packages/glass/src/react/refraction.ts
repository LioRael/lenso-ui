"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type Ref,
  type RefObject,
} from "react";
import { GlassBackdropSourceContext } from "./backdrop-source.js";
import { GlassFusionContext } from "./fusion.js";
import {
  attachGlass,
  attachGlassRim,
  attachContentRefraction,
  refractsBackdrop,
} from "../refraction.js";
import { assignRef } from "./ref.js";
import { paintMovingMaterialBackdrop } from "../backdrop-paints.js";
import { paintMovingBackdrop } from "../panel-backdrop.js";
import { trackPressHighlight } from "../press-highlight.js";

/** Bind shared optics; deferred owners mark their surface as resting or hidden. */
export function useGlassRef<T extends HTMLElement>(
  ref: Ref<T> | undefined,
  enabled: boolean,
  selection = false,
  profileKey?: string,
  sourceAnchor?: RefObject<HTMLElement | null>,
  liveBackdrop = false,
  liveGeometry = false,
  deferOptics = false,
) {
  const [element, setElement] = useState<T | null>(null);
  const fusion = useContext(GlassFusionContext);
  const backdropSource = useContext(GlassBackdropSourceContext);
  useEffect(
    () => (element && enabled ? trackPressHighlight(element) : undefined),
    [element, enabled],
  );
  useLayoutEffect(() => {
    if (!element || !enabled) return;
    let stop: (() => void) | undefined;
    const surface = element.parentElement;
    const nativePaint =
      (deferOptics ||
        surface?.matches('[data-slot="menu-surface"], [data-slot="select-surface"]')) &&
      liveBackdrop &&
      !refractsBackdrop() &&
      /AppleWebKit\//.test(navigator.userAgent)
        ? paintMovingBackdrop(element)
        : undefined;
    let stopped = false;
    let retainedPaint: (() => void) | undefined;
    let fittedObserver: MutationObserver | undefined;
    let state: "resting" | "moving" | "hidden" | undefined;
    const sync = () => {
      const next = !deferOptics
        ? "resting"
        : surface?.hasAttribute("data-material-hidden")
          ? "hidden"
          : surface?.hasAttribute("data-material-resting")
            ? "resting"
            : "moving";
      if (next === state) return;
      const previousState = state;
      state = next;
      fittedObserver?.disconnect();
      fittedObserver = undefined;
      if (refractsBackdrop() && previousState === "moving" && next === "resting" && liveBackdrop)
        retainedPaint = stop;
      else stop?.();
      stop = undefined;
      if (nativePaint) {
        if (next === "hidden") {
          // Install the first native recipe in the queued paint batch before
          // pausing hidden work, so opening never exposes an unowned fallback.
          queueMicrotask(() => {
            if (!stopped && state === "hidden") nativePaint.setVisible(false);
          });
        } else nativePaint.setVisible(true);
        if (next === "resting") stop = attachGlassRim(element, selection);
        return;
      }
      if (next === "hidden") {
        retainedPaint?.();
        retainedPaint = undefined;
      } else if (next === "resting") {
        stop = attachGlass(element, {
          selection,
          profileKey,
          sourceAnchor: sourceAnchor?.current,
          liveBackdrop,
          liveGeometry,
          backdropSource,
        });
        if (retainedPaint) {
          const finish = () => {
            // The synchronous material placeholder is not a decoded fitted lens.
            if (
              !element.style.getPropertyValue("--lg-rim") &&
              !element.hasAttribute("data-lenso-glass-opaque")
            )
              return;
            fittedObserver?.disconnect();
            fittedObserver = undefined;
            retainedPaint?.();
            retainedPaint = undefined;
          };
          fittedObserver = new MutationObserver(finish);
          fittedObserver.observe(element, { attributes: true, attributeFilter: ["style"] });
          finish();
        }
      } else if (next === "moving" && liveBackdrop) {
        stop =
          retainedPaint ??
          (refractsBackdrop()
            ? paintMovingMaterialBackdrop(element)
            : paintMovingBackdrop(element));
        retainedPaint = undefined;
      }
    };
    const observer = deferOptics ? new MutationObserver(sync) : undefined;
    if (surface)
      observer?.observe(surface, {
        attributes: true,
        attributeFilter: ["data-material-resting", "data-material-hidden"],
      });
    sync();
    return () => {
      stopped = true;
      observer?.disconnect();
      fittedObserver?.disconnect();
      stop?.();
      retainedPaint?.();
      nativePaint?.();
    };
  }, [
    element,
    enabled,
    selection,
    profileKey,
    sourceAnchor,
    liveBackdrop,
    liveGeometry,
    backdropSource,
    deferOptics,
  ]);
  useEffect(() => {
    if (!element || !enabled || !fusion || selection) return;
    fusion.members.add(element);
    fusion.update();
    return () => {
      fusion.members.delete(element);
      fusion.update();
    };
  }, [element, enabled, fusion, selection]);
  return useCallback(
    (node: T | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
}

/** Binds foreground refraction, including browsers without SVG backdrop filters. */
export function useContentRefractionRef<T extends HTMLElement>(enabled: boolean) {
  const [element, setElement] = useState<T | null>(null);
  useEffect(() => {
    if (element && enabled) return attachContentRefraction(element);
  }, [element, enabled]);
  return setElement;
}
