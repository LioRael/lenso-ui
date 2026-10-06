import {
  defineTheme,
  themeToCSS,
  themeToVariables,
  type ThemeConfig,
  type ThemeMode,
  type ThemeOverrides,
  type ThemeToken,
} from "./theme.js";

// Runtime validation cannot prove the editor's compile-time key/mode/readonly contract.
const config = {
  name: "typed",
  light: { accent: "var(--brand)", "font-sans": "system-ui", "field-radius": "1rem" },
  dark: { radius: "20px" },
} satisfies ThemeConfig;
const theme = defineTheme(config);
themeToCSS(theme);
themeToVariables(theme, "dark");

// @ts-expect-error Only exact CSS names without -- are editable.
const camelCase: ThemeOverrides = { fieldRadius: "1rem" };
// @ts-expect-error No derived token overrides.
const derived: ThemeOverrides = { "accent-hover": "red" };
// @ts-expect-error Source CSS variable is font-sans, not font-family.
const font: ThemeToken = "font-family";
// @ts-expect-error Only light/dark are exported modes.
const mode: ThemeMode = "system";
// @ts-expect-error Config values are CSS strings, not numbers.
const numeric: ThemeOverrides = { radius: 20 };
// @ts-expect-error Validated copies are readonly.
theme.light.accent = "red";
// @ts-expect-error Preview maps are readonly.
themeToVariables(theme, "light")["--radius"] = "1rem";

void [camelCase, derived, font, mode, numeric];
