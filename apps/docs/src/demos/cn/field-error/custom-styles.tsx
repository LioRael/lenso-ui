// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e, Apache-2.0.
import { FieldError, Input, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
const styles = stylex.create({
  field: {
    width: 256,
    maxWidth: "100%",
  },
  input: {
    backgroundColor: "var(--field-background)",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  error: {
    fontWeight: 500,
  },
});
export function CustomStyles() {
  const [value, setValue] = useState("jr");
  const id = useId();
  const invalid = value.length > 0 && value.length < 3;
  return (
    <TextField xstyle={styles.field} invalid={invalid}>
      <Label htmlFor={id}>用户名</Label>
      <Input
        xstyle={styles.input}
        id={id}
        placeholder="至少 3 个字符"
        value={value}
        onValueChange={setValue}
      />
      {invalid && (
        <FieldError match xstyle={styles.error}>
          用户名至少需要 3 个字符
        </FieldError>
      )}
    </TextField>
  );
}
