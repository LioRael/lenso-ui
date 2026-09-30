"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { TextArea } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    height: 112,
    width: "100%",
    maxWidth: 320,
    fontSize: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    color: { default: "oklch(26.9% 0 0)", ':is(.dark *, [data-theme="dark"] *)': "oklch(97% 0 0)" },
    boxShadow: {
      default: "0 1px 2px 0 rgb(0 0 0 / .05), 0 0 0 1px rgb(0 0 0 / .05)",
      ":focus-visible": "0 1px 2px 0 rgb(0 0 0 / .05), 0 0 0 2px oklch(70.8% 0 0 / .25)",
      ':is(.dark *, [data-theme="dark"] *)':
        "0 1px 2px 0 rgb(0 0 0 / .05), 0 0 0 1px rgb(255 255 255 / .1)",
      ':is(.dark *, [data-theme="dark"] *):focus-visible':
        "0 1px 2px 0 rgb(0 0 0 / .05), 0 0 0 2px oklch(55.6% 0 0 / .3)",
    },
    transitionProperty: "box-shadow, border-color",
    transitionDuration: "150ms",
    "::placeholder": {
      color: {
        default: "oklch(70.8% 0 0)",
        ':is(.dark *, [data-theme="dark"] *)': "oklch(55.6% 0 0)",
      },
    },
  },
});
export function CustomStyles() {
  return <TextArea aria-label="Notes" xstyle={styles.field} placeholder="Add a note..." />;
}
