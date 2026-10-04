// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { DateValue } from "@internationalized/date";
import { Calendar } from "@gravity-ui/icons";
import { Button, DateField } from "@lenso/ui";
import { Form } from "react-aria-components/Form";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function FormExample() {
  const [value, setValue] = useState<DateValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const todayDate = today(getLocalTimeZone());
  const isInvalid = value !== null && value.compare(todayDate) < 0;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value || isInvalid || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("Date submitted:", {
        date: value,
      });
      setValue(null);
      setIsSubmitting(false);
    }, 1500);
  };
  return (
    <Form {...stylex.props(styles.form)} onSubmit={handleSubmit}>
      <DateField
        isRequired
        xstyle={styles.full}
        isInvalid={isInvalid}
        minValue={todayDate}
        name="date"
        value={value}
        onChange={setValue}
      >
        <DateField.Label>预约日期</DateField.Label>
        <DateField.Group>
          <DateField.Prefix>
            <Calendar {...stylex.props(styles.icon)} aria-hidden="true" />
          </DateField.Prefix>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
        {isInvalid ? (
          <DateField.Error>日期须为今天或将来</DateField.Error>
        ) : (
          <DateField.Description>输入日期 from today onwards</DateField.Description>
        )}
      </DateField>
      <Button
        xstyle={styles.full}
        disabled={!value || isInvalid}
        isLoading={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? "提交中…" : "Submit"}
      </Button>
    </Form>
  );
}
