"use client";
import { Avatar, Badge, Separator } from "@lenso/ui";
import { Fragment } from "react";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

const AVATAR_URL = "/assets/demo/avatars/green.svg";
export function BadgeVariants() {
  const variants = ["primary", "secondary", "soft"] as const;
  const colors = ["accent", "default", "success", "warning", "danger"] as const;
  return (
    <div {...stylex.props(s.column8)}>
      {variants.map((variant, index) => (
        <Fragment key={variant}>
          <div {...stylex.props(s.column4)}>
            <h3 {...stylex.props(s.textSm, s.semibold, s.muted, s.capitalize)}>{variant}</h3>
            <div {...stylex.props(s.row6)}>
              {colors.map((color) => (
                <Badge.Anchor key={color}>
                  <Avatar>
                    <Avatar.Image alt="John Doe" src={AVATAR_URL} />
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
