// Modified: compile-time ring layers compose independently of component elevation.
import * as stylex from "@stylexjs/stylex";

export const focusRing = stylex.defineConsts({
  underline: "inset 0 -1.5px 0 var(--lenso-focus-ring)",
  errorUnderline: "inset 0 -1.5px 0 var(--lenso-status-error-indicator)",
  outer: "0 0 0 1.5px var(--lenso-focus-ring)",
  field: "0 0 0 1.5px var(--lenso-focus-ring)",
  outerElevated: "0 0 0 1.5px var(--lenso-focus-ring), var(--lenso-focus-elevation, 0 0 #0000)",
  fieldElevated: "0 0 0 1.5px var(--lenso-focus-ring), var(--lenso-focus-elevation, 0 0 #0000)",
  elevation: "var(--lenso-focus-elevation, 0 0 #0000)",
});
