"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Button, Description, FieldError, Form, InputOTP, Label, TextField } from "@lenso/ui";
import { useState, type FormEvent } from "react";
import { Slots, styles } from "./parts";
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
    alert("Code verified successfully!");
  };
  return (
    <Form xstyle={styles.field} onSubmit={onSubmit}>
      <TextField name="code" invalid={isInvalid}>
        <Label>Verify account</Label>
        <Description>Hint: The code is 123456</Description>
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
        {isInvalid && <FieldError match>Invalid code. Please try again.</FieldError>}
      </TextField>
      <Button disabled={value.length !== 6} type="submit">
        Submit
      </Button>
    </Form>
  );
}
