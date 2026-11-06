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
import { attachGlass, attachContentRefraction } from "../refraction.js";
import { assignRef } from "./ref.js";
import { trackPressHighlight } from "../press-highlight.js";

/** Binds the shared runtime while preserving the caller's ref and cleanup. */
export function useGlassRef<T extends HTMLElement>(
  ref: Ref<T> | undefined,
  enabled: boolean,
  selection = false,
  profileKey?: string,
  sourceAnchor?: RefObject<HTMLElement | null>,
  liveBackdrop = false,
  liveGeometry = false,
) {
  const [element, setElement] = useState<T | null>(null);
  const fusion = useContext(GlassFusionContext);
  const backdropSource = useContext(GlassBackdropSourceContext);
  useEffect(
    () => (element && enabled ? trackPressHighlight(element) : undefined),
    [element, enabled],
  );
  useLayoutEffect(() => {
    if (element && enabled)
      return attachGlass(element, {
        selection,
        profileKey,
        sourceAnchor: sourceAnchor?.current,
        liveBackdrop,
        liveGeometry,
        backdropSource,
      });
  }, [
    element,
    enabled,
    selection,
    profileKey,
    sourceAnchor,
    liveBackdrop,
    liveGeometry,
    backdropSource,
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
