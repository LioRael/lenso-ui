import { isRTL } from "@lenso/primitives/locale/core";
import { createOptionalContext } from "../context.js";
export { isRTL };
export const [getLocale, setLocale] = createOptionalContext<() => string>();
export function useLocale() {
  const current = getLocale() ?? (() => "en-US");
  return {
    get locale() {
      return current();
    },
    get direction() {
      return isRTL(current()) ? ("rtl" as const) : ("ltr" as const);
    },
  };
}
