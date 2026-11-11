const formatters = new Map<string, Intl.NumberFormat>();
export function getFormatter(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
  const key = JSON.stringify([locale, options]);
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    if (formatters.size >= 64) formatters.delete(formatters.keys().next().value!);
    formatters.set(key, formatter);
  }
  return formatter;
}
