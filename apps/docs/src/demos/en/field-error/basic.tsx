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
      <Label>Username</Label>
      <Input placeholder="Enter username" value={value} onValueChange={setValue} />
      {invalid && <FieldError match>Username must be at least 3 characters</FieldError>}
    </TextField>
  );
}
