"use client";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ field: { width: "100%", maxWidth: 280 } });
export function WithTextSuffix() {
  return (
    <TextField xstyle={styles.field} name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Input xstyle={styles.field} defaultValue="example" />
        <InputGroup.Suffix>.com</InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
