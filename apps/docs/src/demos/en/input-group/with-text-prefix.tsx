"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ field: { width: "100%", maxWidth: 280 } });
export function WithTextPrefix() {
  return (
    <TextField xstyle={styles.field} name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Prefix>https://</InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.field} defaultValue="heroui.com" />
      </InputGroup>
    </TextField>
  );
}
