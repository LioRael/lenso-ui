import { materialStyles } from "@lenso/tokens/materials";
import { createContext, useContext, createSignal, type Element as JSXElement } from "solid-js";
import { ThemeScope } from "./providers.jsx";
export type GlassProviderProps = {
  children?: JSXElement;
  tint?: number;
  defaultTint?: number;
  onTintChange?: (value: number) => void;
};
const Context = createContext<{ readonly tint: number; setTint: (value: number) => void }>();
const normalize = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5);
export function GlassProvider(props: GlassProviderProps) {
  const [local, setLocal] = createSignal(normalize(props.defaultTint ?? 0.5));
  const tint = () => normalize(props.tint ?? local());
  const preferences = {
    get tint() {
      return tint();
    },
    setTint(value: number) {
      const next = normalize(value);
      if (props.tint === undefined) setLocal(next);
      props.onTintChange?.(next);
    },
  };
  return (
    <Context value={preferences}>
      <ThemeScope glassTint={tint()} xstyle={materialStyles.provider}>
        {props.children}
      </ThemeScope>
    </Context>
  );
}
export function useGlassPreferences() {
  const value = useContext(Context);
  if (!value) throw new Error("useGlassPreferences requires GlassProvider");
  return value;
}
