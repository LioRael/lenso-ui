export type Locale = "en" | "cn";

export const documentationLocales = [
  { code: "en", label: "English", language: "en" },
  { code: "cn", label: "中文", language: "zh-CN" },
] as const;

export const isLocale = (value: string): value is Locale => value === "en" || value === "cn";
