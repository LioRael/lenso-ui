// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { InputGroup, Kbd, TextField } from "@lenso/ui";
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
export function WithKeyboardShortcut() {
  return (
    <TextField xstyle={styles.field} name="command">
      <InputGroup>
        <InputGroup.Input aria-label="命令" xstyle={styles.field} placeholder="命令" />
        <InputGroup.Suffix xstyle={styles.suffix}>
          <Kbd>
            <Kbd.Abbr keyValue="command" />
            <Kbd.Content>K</Kbd.Content>
          </Kbd>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );
}
