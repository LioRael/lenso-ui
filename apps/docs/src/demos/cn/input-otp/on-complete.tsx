// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Button, Form, InputOTP, Label, Spinner, TextField } from "@lenso/ui";
import { useState, type FormEvent } from "react";
import { Slots, styles } from "../../en/input-otp/parts";
export function OnComplete() {
  const [value, setValue] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isComplete || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setValue("");
      setIsComplete(false);
    }, 2000);
  };
  return (
    <Form xstyle={styles.field} onSubmit={handleSubmit}>
      <TextField name="code">
        <Label>验证账户</Label>
        <InputOTP
          length={6}
          name="code"
          value={value}
          onValueComplete={(code) => {
            setIsComplete(true);
            console.log("Code complete:", code);
          }}
          onValueChange={(next) => {
            setValue(next);
            setIsComplete(false);
          }}
        >
          <Slots />
        </InputOTP>
      </TextField>
      <Button
        xstyle={styles.submit}
        disabled={!isComplete}
        isLoading={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? (
          <>
            <Spinner color="current" size="sm" />
            验证中…
          </>
        ) : (
          "验证验证码"
        )}
      </Button>
    </Form>
  );
}
