export type Locale = "en" | "cn";

export const isLocale = (value: string): value is Locale => value === "en" || value === "cn";
