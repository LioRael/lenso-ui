import { createContext, useContext, omit, type ComponentProps } from "solid-js";
import type { JSX } from "@solidjs/web";
import { isRTL } from "@lenso/primitives/locale/core";
import { htmlPart } from "./parts.js";
export { isRTL };
const Locale = createContext<() => string>(() => "en-US");
export function I18nProvider(props: { locale: string; children?: JSX.Element }) {
  return (
    <Locale value={() => props.locale}>
      <div
        dir={isRTL(props.locale) ? "rtl" : "ltr"}
        lang={props.locale}
        style={{ display: "contents" }}
      >
        {props.children}
      </div>
    </Locale>
  );
}
export function useLocale() {
  const current = useContext(Locale);
  return {
    get locale() {
      return current();
    },
    get direction() {
      return isRTL(current()) ? ("rtl" as const) : ("ltr" as const);
    },
  };
}
const Scope = htmlPart("div", "theme-scope", () => undefined);
export type ThemeScopeProps = ComponentProps<typeof Scope> & {
  theme?: "light" | "dark";
  contrast?: "standard" | "increased";
  level?: "base" | "elevated";
  glassTint?: number;
  glassTransparency?: number;
};
function amount(n: number, fallback: number) {
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : fallback;
}
export function ThemeScope(props: ThemeScopeProps) {
  const style = () => {
    const values: Record<string, string> = {};
    if (props.glassTint !== undefined)
      values["--lenso-glass-tint-amount"] = String(amount(props.glassTint, 0.5));
    if (props.glassTransparency !== undefined)
      values["--lenso-glass-transparency"] = String(amount(props.glassTransparency, 1));
    if (typeof props.style === "string")
      return (
        Object.entries(values)
          .map(([key, val]) => key + ":" + val + ";")
          .join("") + props.style
      );
    return { ...values, ...props.style };
  };
  return (
    <Scope
      {...omit(props, "theme", "contrast", "level", "glassTint", "glassTransparency", "style")}
      data-theme={props.theme ?? props["data-theme"]}
      data-contrast={props.contrast ?? props["data-contrast"]}
      data-level={props.level ?? props["data-level"]}
      style={style()}
    />
  );
}
