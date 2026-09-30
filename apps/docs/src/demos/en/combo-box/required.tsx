"use client";
// HeroUI v3.2.6, Apache-2.0. Base Field context owns validation and error linkage.
import { Button, FieldError, Form, TextField } from "@lenso/ui";
import { AnimalPicker } from "./shared";
import { styles } from "./styles.stylex";

export function AnimalForm({ secondary = false }: { secondary?: boolean }) {
  return (
    <Form
      xstyle={[styles.form, secondary && styles.fullWidth]}
      onSubmit={(event) => {
        event.preventDefault();
        new FormData(event.currentTarget);
        alert("Form submitted successfully!");
      }}
    >
      <TextField name="animal">
        <AnimalPicker required name="animal" fullWidth secondary={secondary} />
        <FieldError />
      </TextField>
      <Button type="submit">Submit</Button>
    </Form>
  );
}
export function Required() {
  return <AnimalForm />;
}
