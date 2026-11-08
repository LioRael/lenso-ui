"use client";
import * as stylex from "@stylexjs/stylex";
import { Fieldset, TextField } from "@lenso/ui";

const styles = stylex.create({ section: { width: 402, maxWidth: "100%" } });

export function Basic() {
  return (
    <Fieldset aria-label="联系信息" xstyle={styles.section}>
      <Fieldset.Group>
        <TextField name="name">
          <TextField.Label>姓名</TextField.Label>
          <TextField.Input clearLabel="清除文本" placeholder="Alex" />
        </TextField>
        <TextField name="email">
          <TextField.Label>邮箱</TextField.Label>
          <TextField.Input clearLabel="清除文本" type="email" placeholder="you@example.com" />
        </TextField>
        <TextField name="company">
          <TextField.Label>公司</TextField.Label>
          <TextField.Input clearLabel="清除文本" defaultValue="Acme" />
        </TextField>
      </Fieldset.Group>
    </Fieldset>
  );
}
