"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { materialStyles } from "@lenso/tokens/materials";
import { ThemeScope } from "./theme-scope.js";

const normalize = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.5;
const Context = createContext<{ tint: number; setTint: (value: number) => void } | null>(null);

export interface GlassProviderProps {
  children: ReactNode;
  /** Controlled appearance: 0 more clear, 0.5 default, 1 more tinted. */
  tint?: number;
  /** Initial uncontrolled appearance. Defaults to 0.5. */
  defaultTint?: number;
  onTintChange?: (value: number) => void;
}

/** App preference owner; local ThemeScope values can override its inherited material setting. */
export function GlassProvider({
  children,
  tint: controlled,
  defaultTint = 0.5,
  onTintChange,
}: GlassProviderProps) {
  const [local, setLocal] = useState(() => normalize(defaultTint));
  const tint = normalize(controlled ?? local);
  const setTint = useCallback(
    (value: number) => {
      const next = normalize(value);
      if (controlled === undefined) setLocal(next);
      onTintChange?.(next);
    },
    [controlled, onTintChange],
  );
  const value = useMemo(() => ({ tint, setTint }), [tint, setTint]);
  return (
    <Context value={value}>
      <ThemeScope glassTint={tint} xstyle={materialStyles.provider}>
        {children}
      </ThemeScope>
    </Context>
  );
}

export function useGlassPreferences(): { tint: number; setTint: (value: number) => void } {
  const value = useContext(Context);
  if (!value) throw new Error("useGlassPreferences requires GlassProvider");
  return value;
}
