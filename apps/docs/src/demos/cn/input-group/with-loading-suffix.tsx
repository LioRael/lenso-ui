// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { InputGroup, Spinner, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: "100%",
    maxWidth: 280,
  },
  spinner: {
    width: 16,
    height: 16,
  },
});
export function WithLoadingSuffix() {
  return (
    <TextField xstyle={styles.field} name="status">
      <InputGroup>
        <InputGroup.Input aria-label="状态" xstyle={styles.field} defaultValue="发送中…" />
        <InputGroup.Suffix>
          <Spinner xstyle={styles.spinner} />
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
