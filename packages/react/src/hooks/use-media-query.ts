"use client";
import { useState } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

export interface UseMediaQueryOptions {
  defaultValue?: boolean;
  initializeWithValue?: boolean;
}

/** Adapted from HeroUI v3.2.6, including its legacy Safari subscription contract. */
export function useMediaQuery(
  query: string,
  { defaultValue = false, initializeWithValue = true }: UseMediaQueryOptions = {},
): boolean {
  const [matches, setMatches] = useState(() =>
    initializeWithValue && typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : defaultValue,
  );
  useIsomorphicLayoutEffect(() => {
    if (!window.matchMedia) return;
    const media = window.matchMedia(query);
    const change = () => setMatches(media.matches);
    change();
    if (media.addEventListener) media.addEventListener("change", change);
    else media.addListener(change);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", change);
      else media.removeListener(change);
    };
  }, [query]);
  return matches;
}
