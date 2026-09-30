"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

const variants = [
  {
    variant: "default",
    label: "Default",
    description: "This is a default surface variant. It uses bg-surface styling.",
  },
  {
    variant: "secondary",
    label: "Secondary",
    description: "This is a secondary surface variant. It uses bg-surface-secondary styling.",
  },
  {
    variant: "tertiary",
    label: "Tertiary",
    description: "This is a tertiary surface variant. It uses bg-surface-tertiary styling.",
  },
  {
    variant: "transparent",
    label: "Transparent",
    description:
      "This is a transparent surface variant. It has no background, suitable for overlays and cards with custom backgrounds.",
  },
] as const;
export function Variants() {
  return (
    <div {...stylex.props(s.column4)}>
      {variants.map(({ variant, label, description }) => (
        <div key={variant} {...stylex.props(s.column2)}>
          <p {...stylex.props(s.textSm, s.medium, s.muted)}>{label}</p>
          <Surface xstyle={[s.surface, variant === "transparent" && s.border]} variant={variant}>
            <h3 {...stylex.props(s.textBase, s.semibold, s.foreground)}>Surface Content</h3>
            <p {...stylex.props(s.textSm, s.muted)}>{description}</p>
          </Surface>
        </div>
      ))}
    </div>
  );
}
