"use client";
import { createContext, use, type ReactNode } from "react";
import { useDirection } from "@base-ui/react/direction-provider";
import { DirectionProvider } from "@base-ui/react/direction-provider";
export function isRTL(locale: string) {
  return /^(Arab|Hebr|Thaa|Nkoo|Adlm|Rohg|Syrc|Samr|Mand)$/.test(
    new Intl.Locale(locale).maximize().script ?? "",
  );
}
const LocaleContext = createContext("en-US");
export function I18nProvider({ locale, children }: { locale: string; children?: ReactNode }) {
  const direction = isRTL(locale) ? "rtl" : "ltr";
  return (
    <LocaleContext value={locale}>
      <DirectionProvider direction={direction}>{children}</DirectionProvider>
    </LocaleContext>
  );
}
export function useLocale() {
  const locale = use(LocaleContext);
  return {
    locale,
    direction: useDirection(),
  };
}
