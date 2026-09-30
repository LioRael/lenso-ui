"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Chip, Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

const variants = ["primary", "secondary", "tertiary", "soft"] as const;
const colors = ["accent", "default", "success", "warning", "danger"] as const;
function ChipMatrix({ isVibrant, title }: { isVibrant?: boolean; title: string }) {
  return (
    <div {...stylex.props(s.column4)} data-vibrant-palette={isVibrant ? "true" : undefined}>
      <h3 {...stylex.props(s.textSm, s.semibold, s.muted)}>{title}</h3>
      <div {...stylex.props(s.row3)}>
        <div {...stylex.props(s.labelCell)} />
        {colors.map((color) => (
          <div key={color} {...stylex.props(s.matrixCell)}>
            <span {...stylex.props(s.textXs, s.muted, s.capitalize)}>{color}</span>
          </div>
        ))}
      </div>
      <div {...stylex.props(s.column3)}>
        {variants.map((variant) => (
          <div key={variant} {...stylex.props(s.row3)}>
            <div {...stylex.props(s.labelCell, s.textSm, s.muted, s.capitalize)}>{variant}</div>
            {colors.map((color) => (
              <div key={color} {...stylex.props(s.matrixCell)}>
                <Chip color={color} size="md" variant={variant}>
                  <Chip.Label xstyle={s.capitalize}>{color}</Chip.Label>
                </Chip>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
export function ChipVibrantPalette() {
  return (
    <div {...stylex.props(s.column8, s.full, s.scroll)}>
      <ChipMatrix title="Default palette" />
      <Separator />
      <ChipMatrix isVibrant title="Vibrant palette" />
    </div>
  );
}
