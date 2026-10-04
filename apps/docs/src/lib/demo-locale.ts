export type DemoLocale = "en" | "cn";
export type DemoManifest = Record<DemoLocale, Record<string, string>>;

export function resolveDemo(manifest: DemoManifest, name: string, locale: DemoLocale) {
  const localized = manifest[locale][name];
  if (localized)
    return {
      file: localized,
      locale,
      status:
        locale === "cn" && localized.startsWith("en/")
          ? "source-equivalent-reuse"
          : "local-adaptation",
    } as const;
  const fallback = locale === "cn" ? manifest.en[name] : undefined;
  return fallback
    ? ({ file: fallback, locale: "en", status: "english-fallback" } as const)
    : undefined;
}
