"use client";
import { usePlaygroundLog } from "../../shared/playground-log";

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
import { Slots, styles } from "../../en/input-otp/parts";
export function FormExample() {
  const log = usePlaygroundLog();
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
        log("Code verified successfully!");
        setValue("");
      } else setError("Invalid code. Please try again.");
      setIsSubmitting(false);
    }, 1500);
  };
  return (
    <Form xstyle={styles.form} onSubmit={handleSubmit}>
      <TextField name="code" invalid={!!error}>
        <Label>双重身份验证</Label>
        <Description>请输入身份验证器应用中的 6 位验证码</Description>
        <InputOTP
          maxLength={6}
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
        variant="prominent"
      >
        {isSubmitting ? (
          <>
            <Spinner color="current" size="sm" />
            验证中…
          </>
        ) : (
          "验证"
        )}
      </Button>
      <div {...stylex.props(styles.help)}>
        <p {...stylex.props(styles.muted)}>遇到问题？</p>
        <Link xstyle={styles.link} href="#">
          使用备用码
        </Link>
      </div>
    </Form>
  );
}
