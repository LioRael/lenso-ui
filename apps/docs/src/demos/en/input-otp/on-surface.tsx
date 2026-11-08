"use client";
import { InputOTP, Label, Link, Surface, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "./parts";
export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <TextField name="code">
        <div {...stylex.props(styles.heading)}>
          <Label>Verify account</Label>
          <p {...stylex.props(styles.muted)}>We&apos;ve sent a code to a****@gmail.com</p>
        </div>
        <InputOTP length={6} name="code" variant="secondary">
          <Slots />
        </InputOTP>
        <div {...stylex.props(styles.resend)}>
          <p {...stylex.props(styles.muted)}>Didn&apos;t receive a code?</p>
          <Link xstyle={styles.link} href="#">
            Resend
          </Link>
        </div>
      </TextField>
    </Surface>
  );
}
