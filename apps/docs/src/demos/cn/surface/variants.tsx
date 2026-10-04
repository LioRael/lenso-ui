// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
const variants = [
  {
    variant: "default",
    label: "默认",
    description: "这是默认表面变体，使用 bg-surface 样式。",
  },
  {
    variant: "secondary",
    label: "次要",
    description: "这是次要表面变体，使用 bg-surface-secondary 样式。",
  },
  {
    variant: "tertiary",
    label: "第三",
    description: "这是第三表面变体，使用 bg-surface-tertiary 样式。",
  },
  {
    variant: "transparent",
    label: "透明",
    description: "这是透明表面变体，无背景，适用于遮罩层和自定义背景的卡片。",
  },
] as const;
export function Variants() {
  return (
    <div {...stylex.props(s.column4)}>
      {variants.map(({ variant, label, description }) => (
        <div key={variant} {...stylex.props(s.column2)}>
          <p {...stylex.props(s.textSm, s.medium, s.muted)}>{label}</p>
          <Surface xstyle={[s.surface, variant === "transparent" && s.border]} variant={variant}>
            <h3 {...stylex.props(s.textBase, s.semibold, s.foreground)}>表面内容</h3>
            <p {...stylex.props(s.textSm, s.muted)}>{description}</p>
          </Surface>
        </div>
      ))}
    </div>
  );
}
