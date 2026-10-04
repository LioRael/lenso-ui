// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Button, Description, FieldError, Form, InputOTP, Label, TextField } from "@lenso/ui";
import { useState, type FormEvent } from "react";
import { Slots, styles } from "../../en/input-otp/parts";
export function WithValidation() {
  const [value, setValue] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = new FormData(event.currentTarget).get("code");
    if (code !== "123456") {
      setIsInvalid(true);
      return;
    }
    setIsInvalid(false);
    setValue("");
    alert("验证码校验成功！");
  };
  return (
    <Form xstyle={styles.field} onSubmit={onSubmit}>
      <TextField name="code" invalid={isInvalid}>
        <Label>验证账户</Label>
        <Description>提示：验证码为 123456</Description>
        <InputOTP
          length={6}
          name="code"
          value={value}
          onValueChange={(next) => {
            setValue(next);
            setIsInvalid(false);
          }}
        >
          <Slots />
        </InputOTP>
        {isInvalid && <FieldError match>验证码无效，请重试。</FieldError>}
      </TextField>
      <Button disabled={value.length !== 6} type="submit">
        提交
      </Button>
    </Form>
  );
}
