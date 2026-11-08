"use client";

import { InputOTP, Label, Link, Surface, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "../../en/input-otp/parts";
export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <TextField name="code">
        <div {...stylex.props(styles.heading)}>
          <Label>验证账户</Label>
          <p {...stylex.props(styles.muted)}>我们已向 a****@gmail.com 发送验证码</p>
        </div>
        <InputOTP length={6} name="code" variant="secondary">
          <Slots />
        </InputOTP>
        <div {...stylex.props(styles.resend)}>
          <p {...stylex.props(styles.muted)}>没有收到验证码？</p>
          <Link xstyle={styles.link} href="#">
            重新发送
          </Link>
        </div>
      </TextField>
    </Surface>
  );
}
