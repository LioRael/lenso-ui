"use client";
import { useCallback, useEffect, useRef } from "react";

/** Adapted from HeroUI v3.2.6 (Apache-2.0). */
export function useIsMounted(): () => boolean {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return useCallback(() => mounted.current, []);
}
