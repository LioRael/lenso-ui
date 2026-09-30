// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Input, Label, TextField } from "@lenso/ui";
import { useId } from "react";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const id = useId();
  return (
    <TextField xstyle={demoStyles.column}>
      <Label htmlFor={id}>姓名</Label>
      <Input xstyle={demoStyles.field} id={id} placeholder="输入你的姓名" />
    </TextField>
  );
}
