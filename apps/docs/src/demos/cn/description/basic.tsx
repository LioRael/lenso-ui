"use client";

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
