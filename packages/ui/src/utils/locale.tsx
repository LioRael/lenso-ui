"use client";
import { createContext, use, type ReactNode } from "react";
import { isRTL } from "@lenso/primitives/locale/core";
export { isRTL };
const LocaleContext = createContext("en-US");
export function I18nProvider({ locale, children }: { locale: string; children?: ReactNode }) {
  const direction = isRTL(locale) ? "rtl" : "ltr";
  return (
    <LocaleContext value={locale}>
      <div lang={locale} dir={direction} style={{ display: "contents" }}>
        {children}
      </div>
    </LocaleContext>
  );
}
export function useLocale() {
  const locale = use(LocaleContext);
  return {
    locale,
    direction: isRTL(locale) ? ("rtl" as const) : ("ltr" as const),
  };
}
