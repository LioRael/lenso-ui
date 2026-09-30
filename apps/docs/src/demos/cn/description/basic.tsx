// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Description, Input, Label, TextField } from "@lenso/ui";
import { useId } from "react";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const id = useId();
  return (
    <TextField xstyle={demoStyles.column}>
      <Label htmlFor={id}>邮箱</Label>
      <Input
        aria-describedby={`${id}-description`}
        xstyle={demoStyles.field}
        id={id}
        placeholder="you@example.com"
        type="email"
      />
      <Description id={`${id}-description`}>我们不会将你的邮箱分享给任何人。</Description>
    </TextField>
  );
}
