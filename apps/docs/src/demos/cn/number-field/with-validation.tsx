// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, FieldError, Label, NumberField, TextField } from "@lenso/ui";
import { useState } from "react";
import { Controls, styles } from "../../en/number-field/parts";
export function WithValidation() {
  const [value, setValue] = useState<number | null>(null);
  const isInvalid = value !== null && (value < 0 || value > 1);
  return (
    <TextField
      invalid={isInvalid}
      name="percentage"
      validationMode="onChange"
      xstyle={styles.field}
    >
      <NumberField
        required
        format={{
          style: "percent",
        }}
        min={0}
        max={1}
        name="percentage"
        step={0.1}
        value={value}
        onValueChange={setValue}
        allowOutOfRange
      >
        <Label required>百分比</Label>
        <Controls />
        {isInvalid ? (
          <FieldError match>百分比必须在 0 到 100 之间</FieldError>
        ) : (
          <Description>请输入 0 到 100 之间的值</Description>
        )}
      </NumberField>
    </TextField>
  );
}
