// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, InputOTP, Label, TextField } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "../../en/input-otp/parts";
export function Controlled() {
  const [value, setValue] = useState("");
  return (
    <TextField name="code" xstyle={styles.field}>
      <Label>验证账户</Label>
      <InputOTP length={6} name="code" value={value} onValueChange={setValue}>
        <Slots />
      </InputOTP>
      <Description>
        {value.length > 0 ? (
          <>
            值：{value} ({value.length}/6) •{" "}
            <button type="button" {...stylex.props(styles.clear)} onClick={() => setValue("")}>
              Clear
            </button>
          </>
        ) : (
          "请输入 6 位验证码"
        )}
      </Description>
    </TextField>
  );
}
