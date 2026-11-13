"use client";
import { Description, FieldError, Label, NumberField, TextField } from "@lenso/ui";
import { useState } from "react";
import { Controls, styles } from "./parts";

export function WithValidation() {
  const [value, setValue] = useState<number | null>(null);
  const isInvalid = value !== null && (value < 0 || value > 1);
  return (
    <TextField invalid={isInvalid} name="percentage" xstyle={styles.field}>
      <NumberField
        required
        format={{ style: "percent" }}
        min={0}
        max={1}
        name="percentage"
        step={0.1}
        value={value}
        onValueChange={setValue}
      >
        <Label required>Percentage</Label>
        <Controls />
        {isInvalid ? (
          <FieldError match>Percentage must be between 0 and 100</FieldError>
        ) : (
          <Description>Enter a value between 0 and 100</Description>
        )}
      </NumberField>
    </TextField>
  );
}
