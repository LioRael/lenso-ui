"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import {
  Button,
  Description,
  FieldError,
  Form,
  InputOTP,
  Label,
  Link,
  Spinner,
  TextField,
} from "@lenso/ui";
import { useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "./parts";
export function FormExample() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    if (value.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      if (value === "123456") {
        console.log("Code verified successfully!");
        setValue("");
      } else setError("Invalid code. Please try again.");
      setIsSubmitting(false);
    }, 1500);
  };
  return (
    <Form xstyle={styles.form} onSubmit={handleSubmit}>
      <TextField name="code" invalid={!!error}>
        <Label>Two-factor authentication</Label>
        <Description>Enter the 6-digit code from your authenticator app</Description>
        <InputOTP
          length={6}
          name="code"
          value={value}
          onValueChange={(next) => {
            setValue(next);
            setError("");
          }}
        >
          <Slots />
        </InputOTP>
        {error && <FieldError match>{error}</FieldError>}
      </TextField>
      <Button
        xstyle={styles.full}
        disabled={value.length !== 6}
        isLoading={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? (
          <>
            <Spinner color="current" size="sm" />
            Verifying...
          </>
        ) : (
          "Verify"
        )}
      </Button>
      <div {...stylex.props(styles.help)}>
        <p {...stylex.props(styles.muted)}>Having trouble?</p>
        <Link xstyle={styles.link} href="#">
          Use backup code
        </Link>
      </div>
    </Form>
  );
}
