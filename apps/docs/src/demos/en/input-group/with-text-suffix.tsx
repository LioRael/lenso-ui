"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ field: { width: "100%", maxWidth: 280 } });
export function WithTextSuffix() {
  return (
    <TextField xstyle={styles.field} name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Input xstyle={styles.field} defaultValue="heroui" />
        <InputGroup.Suffix>.com</InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
