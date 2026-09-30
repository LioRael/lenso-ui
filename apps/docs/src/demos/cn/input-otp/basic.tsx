// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Button, InputOTP } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const [value, setValue] = useState("");
  return (
    <div {...stylex.props(demoStyles.wideColumn)}>
      <strong>验证账户</strong>
      <p {...stylex.props(demoStyles.muted)}>
        Enter a six-digit example code. This demo does not send verification messages.
      </p>
      <InputOTP length={6} value={value} onValueChange={setValue}>
        <InputOTP.Group>
          {[1, 2, 3].map((number) => (
            <InputOTP.Slot key={number} aria-label={`Digit ${number}`} />
          ))}
        </InputOTP.Group>
        <InputOTP.Separator />
        <InputOTP.Group>
          {[4, 5, 6].map((number) => (
            <InputOTP.Slot key={number} aria-label={`Digit ${number}`} />
          ))}
        </InputOTP.Group>
      </InputOTP>
      <Button variant="ghost" onClick={() => setValue("")}>
        Reset code
      </Button>
    </div>
  );
}
