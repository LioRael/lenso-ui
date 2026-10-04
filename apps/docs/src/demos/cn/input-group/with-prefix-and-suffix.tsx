// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Description, InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: "100%",
    maxWidth: 280,
  },
  input: {
    width: "100%",
    maxWidth: 200,
  },
});
export function WithPrefixAndSuffix() {
  return (
    <TextField xstyle={styles.field} name="price">
      <Label>设置价格</Label>
      <InputGroup>
        <InputGroup.Prefix>$</InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.input} defaultValue="10" type="number" />
        <InputGroup.Suffix>USD</InputGroup.Suffix>
      </InputGroup>
      <Description>客户将支付的价格</Description>
    </TextField>
  );
}
