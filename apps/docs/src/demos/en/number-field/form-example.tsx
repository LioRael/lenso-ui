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
import { Controls, styles } from "./parts";

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
      console.log("Order submitted:", { quantity: value });
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
          <Label required>Order quantity</Label>
          <Controls />
          {isOutOfStock ? (
            <FieldError match>Only {stockAvailable} items left in stock</FieldError>
          ) : (
            <Description>Only {stockAvailable} items available</Description>
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
            Processing...
          </>
        ) : (
          "Place Order"
        )}
      </Button>
    </Form>
  );
}
