"use client";
import { useMemo } from "react";
import { useIsHydrated } from "./use-is-hydrated.js";

const values = new Map<string, string | undefined>();

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
    const value =
      getComputedStyle(document.documentElement).getPropertyValue(variableName).trim() || undefined;
    if (cache) values.set(variableName, value);
    return value;
  }, [variableName, override, cache, hydrated]);
}
