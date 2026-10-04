// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
// oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Native horizontal overflow needs an explicit keyboard focus target.
import { CircleDashed } from "@gravity-ui/icons";
import { Chip, Separator } from "@lenso/ui";
import { Fragment } from "react";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
const COLOR_LABELS = {
  accent: "强调",
  danger: "危险",
  default: "默认",
  success: "成功",
  warning: "警告",
};
const VARIANT_LABELS = {
  primary: "主要",
  secondary: "次要",
  soft: "柔和",
  tertiary: "第三",
};
const SIZE_LABELS = {
  lg: "大",
  md: "中",
  sm: "小",
};
export function ChipVariants() {
  const sizes = ["lg", "md", "sm"] as const;
  const variants = ["primary", "secondary", "tertiary", "soft"] as const;
  const colors = ["accent", "default", "success", "warning", "danger"] as const;
  return (
    <div tabIndex={0} {...stylex.props(s.column8, s.scroll)}>
      {sizes.map((size, index) => (
        <Fragment key={size}>
          <div {...stylex.props(s.column4)}>
            <h3 {...stylex.props(s.textSm, s.semibold, s.muted, s.capitalize)}>
              {SIZE_LABELS[size]}
            </h3>
            <div {...stylex.props(s.row3)}>
              <div {...stylex.props(s.labelCell)} />
              {colors.map((color) => (
                <div key={color} {...stylex.props(s.matrixCell)}>
                  <span {...stylex.props(s.textXs, s.muted, s.capitalize)}>
                    {COLOR_LABELS[color]}
                  </span>
                </div>
              ))}
            </div>
            <div {...stylex.props(s.column3)}>
              {variants.map((variant) => (
                <div key={variant} {...stylex.props(s.row3)}>
                  <div {...stylex.props(s.labelCell, s.textSm, s.muted, s.capitalize)}>
                    {VARIANT_LABELS[variant]}
                  </div>
                  {colors.map((color) => (
                    <div key={color} {...stylex.props(s.matrixCell)}>
                      <Chip color={color} size={size} variant={variant}>
                        <CircleDashed />
                        <Chip.Label>Label</Chip.Label>
                        <CircleDashed />
                      </Chip>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          {index < sizes.length - 1 && <Separator />}
        </Fragment>
      ))}
    </div>
  );
}
