"use client";
// Adapted from HeroUI v3.2.6, Apache-2.0.
import { InputGroup, Kbd, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: { width: "100%", maxWidth: 280 },
  suffix: { paddingInlineEnd: 8 },
});
export function WithKeyboardShortcut() {
  return (
    <TextField xstyle={styles.field} name="command">
      <InputGroup>
        <InputGroup.Input aria-label="Command" xstyle={styles.field} placeholder="Command" />
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
