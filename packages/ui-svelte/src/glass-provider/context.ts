import { createOptionalContext } from "../context.js";
export const [getPreferences, setPreferences] = createOptionalContext<{
  readonly tint: number;
  setTint: (value: number) => void;
}>();
export function useGlassPreferences() {
  const value = getPreferences();
  if (!value) throw new Error("useGlassPreferences requires GlassProvider");
  return value;
}
