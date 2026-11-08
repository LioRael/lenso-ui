"use client";
import { Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";
import { surfaceDemoStyles } from "./surface-demo.stylex";

const variants = [
  {
    variant: "glass",
    label: "Glass",
    description: "Thick blur material, following the supplied Popover background.",
  },
  {
    variant: "default",
    label: "Default",
    description: "Grouped secondary background, shared with form groups and lists.",
  },
  {
    variant: "secondary",
    label: "Secondary",
    description: "Secondary background for ordinary content, outside the grouped hierarchy.",
  },
  {
    variant: "tertiary",
    label: "Tertiary",
    description: "Tertiary grouped background for a necessary deeper layer.",
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
        <div key={variant} {...stylex.props(s.column2, variant === "glass" && s.glassScene)}>
          {variant === "glass" && (
            <div data-lenso-backdrop aria-hidden="true" {...stylex.props(s.glassBackdrop)} />
          )}
          <p {...stylex.props(s.textSm, s.medium, s.muted)}>{label}</p>
          <Surface
            xstyle={[
              surfaceDemoStyles.panel,
              variant === "transparent" && s.border,
              variant === "glass" && s.glassCard,
            ]}
            variant={variant}
          >
            <h3 {...stylex.props(s.textBase, s.semibold, s.foreground)}>Surface Content</h3>
            <p {...stylex.props(s.textSm, s.muted)}>{description}</p>
          </Surface>
        </div>
      ))}
    </div>
  );
}
