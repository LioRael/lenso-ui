"use client";

import { Globe } from "@gravity-ui/icons";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: "100%",
    maxWidth: 280,
  },
  icon: {
    width: 16,
    height: 16,
    color: "var(--lenso-label-secondary)",
  },
});
export function WithIconPrefixAndTextSuffix() {
  return (
    <TextField xstyle={styles.field} name="website">
      <Label>网站</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Globe aria-hidden="true" {...stylex.props(styles.icon)} />
        </InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.field} defaultValue="example" />
        <InputGroup.Suffix>.com</InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
