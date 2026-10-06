// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
// Modified: compile-time ring layers compose independently of component elevation.
import * as stylex from "@stylexjs/stylex";

export const focusRing = stylex.defineConsts({
  outer:
    "0 0 0 var(--ring-offset-width, 2px) var(--background), 0 0 0 calc(var(--ring-offset-width, 2px) + 2px) var(--focus)",
  field: "0 0 0 2px var(--focus)",
  outerElevated:
    "0 0 0 var(--ring-offset-width, 2px) var(--background), 0 0 0 calc(var(--ring-offset-width, 2px) + 2px) var(--focus), var(--lenso-focus-elevation, 0 0 #0000)",
  fieldElevated: "0 0 0 2px var(--focus), var(--lenso-focus-elevation, 0 0 #0000)",
  elevation: "var(--lenso-focus-elevation, 0 0 #0000)",
});
