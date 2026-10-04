// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Avatar, Badge, Separator } from "@lenso/ui";
import { Fragment } from "react";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
const VARIANT_LABELS = {
  primary: "主色",
  secondary: "次色",
  soft: "柔和",
};
const AVATAR_URL = "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg";
export function BadgeVariants() {
  const variants = ["primary", "secondary", "soft"] as const;
  const colors = ["accent", "default", "success", "warning", "danger"] as const;
  return (
    <div {...stylex.props(s.column8)}>
      {variants.map((variant, index) => (
        <Fragment key={variant}>
          <div {...stylex.props(s.column4)}>
            <h3 {...stylex.props(s.textSm, s.semibold, s.muted, s.capitalize)}>
              {VARIANT_LABELS[variant]}
            </h3>
            <div {...stylex.props(s.row6)}>
              {colors.map((color) => (
                <Badge.Anchor key={color}>
                  <Avatar>
                    <Avatar.Image alt="头像" src={AVATAR_URL} />
                    <Avatar.Fallback>JD</Avatar.Fallback>
                  </Avatar>
                  <Badge color={color} size="sm" variant={variant}>
                    5
                  </Badge>
                </Badge.Anchor>
              ))}
            </div>
          </div>
          {index < variants.length - 1 && <Separator />}
        </Fragment>
      ))}
    </div>
  );
}
