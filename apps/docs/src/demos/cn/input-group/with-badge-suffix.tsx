// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Chip, InputGroup, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: "100%",
    maxWidth: 280,
  },
  suffix: {
    paddingInlineEnd: 8,
  },
});
export function WithBadgeSuffix() {
  return (
    <TextField xstyle={styles.field} name="email">
      <InputGroup>
        <InputGroup.Input aria-label="邮箱地址" xstyle={styles.field} placeholder="邮箱地址" />
        <InputGroup.Suffix xstyle={styles.suffix}>
          <Chip color="accent" size="md" variant="soft">
            Pro
          </Chip>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
