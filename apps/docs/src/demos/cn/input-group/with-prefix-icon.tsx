"use client";

import { Envelope } from "@gravity-ui/icons";
import { Description, InputGroup, Label, TextField } from "@lenso/ui";
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
export function WithPrefixIcon() {
  return (
    <TextField xstyle={styles.field} name="email">
      <Label>邮箱地址</Label>
      <InputGroup>
        <InputGroup.Prefix>
          <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
        </InputGroup.Prefix>
        <InputGroup.Input xstyle={styles.field} placeholder="name@email.com" />
      </InputGroup>
      <Description>我们不会将此邮箱分享给任何人</Description>
    </TextField>
  );
}
