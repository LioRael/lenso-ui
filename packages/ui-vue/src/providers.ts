import { isRTL } from "@lenso/primitives/locale/core";
import { defineComponent, h, inject, provide, type InjectionKey, type PropType } from "vue";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

export { isRTL };
const Locale: InjectionKey<() => string> = Symbol("LensoLocale");

export const I18nProvider = defineComponent({
  name: "LensoI18nProvider",
  props: { locale: { type: String, required: true } },
  setup(props, { slots }) {
    provide(Locale, () => props.locale);
    return () =>
      h(
        "div",
        {
          dir: isRTL(props.locale) ? "rtl" : "ltr",
          lang: props.locale,
          style: { display: "contents" },
        },
        slots["default"]?.(),
      );
  },
});

export function useLocale() {
  const locale = inject(Locale, () => "en-US");
  return {
    get locale() {
      return locale();
    },
    get direction() {
      return isRTL(locale()) ? ("rtl" as const) : ("ltr" as const);
    },
  };
}

function amount(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

const Scope = defineComponent({
  name: "LensoThemeScope",
  inheritAttrs: false,
  props: {
    theme: String as PropType<"light" | "dark">,
    contrast: String as PropType<"standard" | "increased">,
    level: String as PropType<"base" | "elevated">,
    glassTint: Number,
    glassTransparency: Number,
  },
  setup(props, { attrs, slots }) {
    return () => {
      const values: Record<string, string> = {};
      if (props.glassTint !== undefined)
        values["--lenso-glass-tint-amount"] = String(amount(props.glassTint, 0.5));
      if (props.glassTransparency !== undefined)
        values["--lenso-glass-transparency"] = String(amount(props.glassTransparency, 1));
      return h(
        "div",
        partAttributes("theme-scope", undefined, {
          ...attrs,
          "data-theme": props.theme ?? attrs["data-theme"],
          "data-contrast": props.contrast ?? attrs["data-contrast"],
          "data-level": props.level ?? attrs["data-level"],
          style: [values, attrs["style"]],
        }),
        slots["default"]?.(),
      );
    };
  },
});
export const ThemeScope: StyledPart<typeof Scope, import("vue").HTMLAttributes> =
  Scope as unknown as StyledPart<typeof Scope, import("vue").HTMLAttributes>;
export type ThemeScopeProps = ComponentProps<typeof ThemeScope>;
