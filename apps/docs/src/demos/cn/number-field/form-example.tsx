// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import {
  Button,
  Description,
  FieldError,
  Form,
  Label,
  NumberField,
  Spinner,
  TextField,
} from "@lenso/ui";
import { useState, type FormEvent } from "react";
import { Controls, styles } from "../../en/number-field/parts";
export function FormExample() {
  const [value, setValue] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stockAvailable = 3;
  const isOutOfStock = value !== null && value > stockAvailable;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value === null || value < 1 || value > stockAvailable || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      console.log("Order submitted:", {
        quantity: value,
      });
      setValue(null);
      setIsSubmitting(false);
    }, 1500);
  };
  return (
    <Form xstyle={styles.form} onSubmit={handleSubmit}>
      <TextField name="quantity" invalid={isOutOfStock} validationMode="onChange">
        <NumberField
          required
          min={1}
          max={5}
          name="quantity"
          value={value}
          onValueChange={setValue}
        >
          <Label required>订购数量</Label>
          <Controls />
          {isOutOfStock ? (
            <FieldError match>仅剩{stockAvailable}件库存</FieldError>
          ) : (
            <Description>仅剩{stockAvailable}件可购</Description>
          )}
        </NumberField>
      </TextField>
      <Button
        xstyle={styles.full}
        disabled={value === null || value < 1 || value > stockAvailable}
        isLoading={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? (
          <>
            <Spinner color="current" size="sm" />
            处理中…
          </>
        ) : (
          "下单"
        )}
      </Button>
    </Form>
  );
}
