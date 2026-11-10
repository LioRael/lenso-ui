import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AccessibilityInfo, Platform, useColorScheme, type ViewProps } from "react-native";
import { requireNativeView } from "expo";
import { contexts, css, html } from "react-strict-dom";
import { colors } from "./theme.css";
import { palettes } from "./palette";
import type { LensoProviderProps } from "./types";

const NativeAppearance =
  Platform.OS === "ios"
    ? requireNativeView<ViewProps & { dark: boolean }>("LensoGlass", "AppearanceView")
    : null;

const light = Object.fromEntries(
  Object.entries(css.createTheme(colors, palettes.light)).filter(([key]) => key !== "$$theme"),
);
const dark = Object.fromEntries(
  Object.entries(css.createTheme(colors, palettes.dark)).filter(([key]) => key !== "$$theme"),
);
const styles = css.create({
  root: { display: "flex", flexDirection: "column", width: "100%", height: "100%" },
});
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
  const value = useMemo(
    () => ({
      dark: isDark,
      opaque: opaque || reduceTransparency === true,
      reducedMotion,
      palette: isDark ? palettes.dark : palettes.light,
    }),
    [isDark, opaque, reduceTransparency, reducedMotion],
  );
  const content = (
    <contexts.ThemeProvider customProperties={isDark ? dark : light}>
      <html.div style={styles.root}>{children}</html.div>
    </contexts.ThemeProvider>
  );
  return (
    <Context value={value}>
      {NativeAppearance ? (
        <NativeAppearance dark={isDark} style={{ flex: 1 }}>
          {content}
        </NativeAppearance>
      ) : (
        content
      )}
    </Context>
  );
}

export const useLensoAppearance = () => useContext(Context);
