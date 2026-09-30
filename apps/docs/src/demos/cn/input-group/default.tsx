// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Envelope } from "@gravity-ui/icons";
import { InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  field: {
    width: "100%",
    maxWidth: 280,
  },
});
export function Default() {
  return (
    <TextField xstyle={styles.field} name="email">
      <Label>邮箱地址</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Envelope aria-hidden="true" />
        </InputGroup.Prefix>
        <InputGroup.Input type="email" placeholder="name@email.com" />
      </InputGroup>
    </TextField>
  );
}
