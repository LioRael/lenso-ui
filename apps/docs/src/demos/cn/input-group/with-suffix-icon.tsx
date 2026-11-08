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
export function WithSuffixIcon() {
  return (
    <TextField xstyle={styles.field} name="email">
      <Label>邮箱地址</Label>
      <InputGroup>
        <InputGroup.Input xstyle={styles.field} placeholder="name@email.com" />
        <InputGroup.Suffix>
          <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
        </InputGroup.Suffix>
      </InputGroup>
      <Description>我们不会发送垃圾邮件</Description>
    </TextField>
  );
}
