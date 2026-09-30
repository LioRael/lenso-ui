"use client";
import { useMemo } from "react";
import { useIsHydrated } from "./use-is-hydrated.js";

const values = new Map<string, string | undefined>();

/** HeroUI v3.2.6 adaptation; hydration is native React rather than React Aria. */
export function useCSSVariable(
  variableName: string,
  override?: string,
  cache = true,
): string | undefined {
  const hydrated = useIsHydrated();
  return useMemo(() => {
    if (override !== undefined) return override;
    if (!hydrated) return undefined;
    if (cache && values.has(variableName)) return values.get(variableName);
    try {
      const value =
        getComputedStyle(document.documentElement).getPropertyValue(variableName).trim() ||
        undefined;
      if (cache) values.set(variableName, value);
      return value;
    } catch {
      return undefined;
    }
  }, [variableName, override, cache, hydrated]);
}
