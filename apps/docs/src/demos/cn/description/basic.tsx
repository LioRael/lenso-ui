// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Description, Input, Label } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const id = useId();
  return (
    <div {...stylex.props(demoStyles.column)}>
      <Label htmlFor={id}>邮箱</Label>
      <Input
        aria-describedby={`${id}-description`}
        xstyle={demoStyles.field}
        id={id}
        placeholder="you@example.com"
        type="email"
      />
      <Description id={`${id}-description`}>我们不会将你的邮箱分享给任何人。</Description>
    </div>
  );
}
