"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { InputGroup, Spinner, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: { width: "100%", maxWidth: 280 },
  spinner: { width: 16, height: 16 },
});
export function WithLoadingSuffix() {
  return (
    <TextField xstyle={styles.field} name="status">
      <InputGroup>
        <InputGroup.Input xstyle={styles.field} defaultValue="Sending..." />
        <InputGroup.Suffix>
          <Spinner xstyle={styles.spinner} />
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
