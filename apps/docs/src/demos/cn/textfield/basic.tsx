// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Input, Label, TextField } from "@lenso/ui";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  return (
    <TextField name="email" xstyle={demoStyles.field}>
      <Label>邮箱</Label>
      <Input type="email" placeholder="输入你的邮箱" />
    </TextField>
  );
}
