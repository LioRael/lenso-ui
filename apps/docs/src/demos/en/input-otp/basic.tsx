"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { InputOTP, Label, Link, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "./parts";
export function Basic() {
  return (
    <TextField name="code" xstyle={styles.field}>
      <div {...stylex.props(styles.heading)}>
        <Label>Verify account</Label>
        <p {...stylex.props(styles.muted)}>We&apos;ve sent a code to a****@gmail.com</p>
      </div>
      <InputOTP length={6} name="code">
        <Slots />
      </InputOTP>
      <div {...stylex.props(styles.resend)}>
        <p {...stylex.props(styles.muted)}>Didn&apos;t receive a code?</p>
        <Link xstyle={styles.link} href="#">
          Resend
        </Link>
      </div>
    </TextField>
  );
}
