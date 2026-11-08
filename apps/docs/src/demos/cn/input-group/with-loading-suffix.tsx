"use client";

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
