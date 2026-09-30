"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Description, InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: { width: "100%", maxWidth: 280 },
  input: { width: "100%", maxWidth: 200 },
});
export function WithPrefixAndSuffix() {
  return (
    <TextField xstyle={styles.field} name="price">
      <Label>Set a price</Label>
      <InputGroup>
        <InputGroup.Prefix>$</InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.input} defaultValue="10" type="number" />
        <InputGroup.Suffix>USD</InputGroup.Suffix>
      </InputGroup>
      <Description>What customers would pay</Description>
    </TextField>
  );
}
