"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Globe } from "@gravity-ui/icons";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: { width: "100%", maxWidth: 280 },
  icon: { width: 16, height: 16, color: "var(--muted)" },
});
export function WithIconPrefixAndTextSuffix() {
  return (
    <TextField xstyle={styles.field} name="website">
      <Label>Website</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Globe aria-hidden="true" {...stylex.props(styles.icon)} />
        </InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.field} defaultValue="heroui" />
        <InputGroup.Suffix>.com</InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
