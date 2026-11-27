export function isRTL(locale: string) {
  return /^(Arab|Hebr|Thaa|Nkoo|Adlm|Rohg|Syrc|Samr|Mand)$/.test(
    new Intl.Locale(locale).maximize().script ?? "",
  );
}
