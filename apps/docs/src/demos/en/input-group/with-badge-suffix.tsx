"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Chip, InputGroup, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: { width: "100%", maxWidth: 280 },
  suffix: { paddingInlineEnd: 8 },
});
export function WithBadgeSuffix() {
  return (
    <TextField xstyle={styles.field} name="email">
      <InputGroup>
        <InputGroup.Input
          aria-label="Email address"
          xstyle={styles.field}
          placeholder="Email address"
        />
        <InputGroup.Suffix xstyle={styles.suffix}>
          <Chip color="accent" size="md" variant="soft">
            Pro
          </Chip>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
