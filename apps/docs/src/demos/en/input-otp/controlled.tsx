"use client";
import { Description, InputOTP, Label, TextField } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "./parts";
export function Controlled() {
  const [value, setValue] = useState("");
  return (
    <TextField name="code" xstyle={styles.field}>
      <Label>Verify account</Label>
      <InputOTP maxLength={6} name="code" value={value} onValueChange={setValue}>
        <Slots />
      </InputOTP>
      <Description>
        {value.length > 0 ? (
          <>
            Value: {value} ({value.length}/6) •{" "}
            <button type="button" {...stylex.props(styles.clear)} onClick={() => setValue("")}>
              Clear
            </button>
          </>
        ) : (
          "Enter a 6-digit code"
        )}
      </Description>
    </TextField>
  );
}
