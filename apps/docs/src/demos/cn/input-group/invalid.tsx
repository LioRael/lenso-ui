"use client";

import { Envelope } from "@gravity-ui/icons";
import { FieldError, InputGroup, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  field: {
    width: "100%",
    maxWidth: 280,
  },
  price: {
    width: "100%",
    maxWidth: 200,
  },
  icon: {
    width: 16,
    height: 16,
    color: "var(--lenso-label-secondary)",
  },
});
export function Invalid() {
  return (
    <div {...stylex.props(styles.stack)}>
      <TextField invalid xstyle={styles.field} name="email">
        <Label required>邮箱地址</Label>
        <InputGroup>
          <InputGroup.Prefix>
            <Envelope aria-hidden="true" {...stylex.props(styles.icon)} />
          </InputGroup.Prefix>
          <InputGroup.Input required xstyle={styles.field} placeholder="name@email.com" />
        </InputGroup>
        <FieldError match>请输入有效的邮箱地址</FieldError>
      </TextField>
      <TextField invalid xstyle={styles.field} name="price">
        <Label required>设置价格</Label>
        <InputGroup>
          <InputGroup.Prefix>$</InputGroup.Prefix>
          <InputGroup.Input required xstyle={styles.price} placeholder="0" type="number" />
          <InputGroup.Suffix>USD</InputGroup.Suffix>
        </InputGroup>
        <FieldError match>价格必须大于 0</FieldError>
      </TextField>
    </div>
  );
}
