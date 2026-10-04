// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { FieldError, Input, Label, TextField } from "@lenso/ui";
import { useState } from "react";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const [value, setValue] = useState("jr");
  const invalid = value.length > 0 && value.length < 3;
  return (
    <TextField xstyle={demoStyles.field} invalid={invalid}>
      <Label>用户名</Label>
      <Input placeholder="输入用户名" value={value} onValueChange={setValue} />
      {invalid && <FieldError match>用户名至少需要 3 个字符</FieldError>}
    </TextField>
  );
}
