"use client";

import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: "100%",
    maxWidth: 280,
  },
});
export function WithTextPrefix() {
  return (
    <TextField xstyle={styles.field} name="website">
      <Label>网站</Label>
      <InputGroup>
        <InputGroup.Prefix>https://</InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.field} defaultValue="example.com" />
      </InputGroup>
    </TextField>
  );
}
