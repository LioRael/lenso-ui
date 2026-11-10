import { createContext, useContext, useEffect, useState } from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";
import { contexts, css, html } from "react-strict-dom";
import { colors } from "./theme.css";
import { palettes } from "./palette";
import type { LensoProviderProps } from "./types";

const light = Object.fromEntries(
  Object.entries(css.createTheme(colors, palettes.light)).filter(([key]) => key !== "$$theme"),
);
const dark = Object.fromEntries(
  Object.entries(css.createTheme(colors, palettes.dark)).filter(([key]) => key !== "$$theme"),
);
const styles = css.create({ root: { display: "flex", flex: 1 } });
const Context = createContext({
  dark: false,
  opaque: false,
  reducedMotion: false,
  palette: palettes.light as Record<keyof typeof palettes.light, string>,
});

export function LensoProvider({
  appearance = "system",
  reduceTransparency,
  children,
}: LensoProviderProps) {
  const system = useColorScheme();
  const isDark = appearance === "system" ? system === "dark" : appearance === "dark";
  const [opaque, setOpaque] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (active) setOpaque(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (active) setReducedMotion(value);
    });
    const transparency = AccessibilityInfo.addEventListener("reduceTransparencyChanged", setOpaque);
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", setReducedMotion);
    return () => {
      active = false;
      transparency.remove();
      motion.remove();
    };
  }, []);
  return (
    <Context
      value={{
        dark: isDark,
        opaque: opaque || reduceTransparency === true,
        reducedMotion,
        palette: isDark ? palettes.dark : palettes.light,
      }}
    >
      <contexts.ThemeProvider customProperties={isDark ? dark : light}>
        <html.div style={styles.root}>{children}</html.div>
      </contexts.ThemeProvider>
    </Context>
  );
}

export const useLensoAppearance = () => useContext(Context);
