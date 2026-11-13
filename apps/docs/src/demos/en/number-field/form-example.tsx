"use client";
import { usePlaygroundLog } from "../../shared/playground-log";
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
  const log = usePlaygroundLog();
  const [value, setValue] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const stockAvailable = 3;
  const isOutOfStock = value !== null && value > stockAvailable;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value === null || value < 1 || value > stockAvailable || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      log("Order submitted:", { quantity: value });
      setValue(null);
      setIsSubmitting(false);
    }, 1500);
  };
  return (
    <Form xstyle={styles.form} onSubmit={handleSubmit}>
      <TextField name="quantity" invalid={isOutOfStock}>
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
        variant="prominent"
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
