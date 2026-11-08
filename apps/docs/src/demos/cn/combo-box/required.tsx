"use client";

// Base Field context owns validation and error linkage.
import { Button, FieldError, Form, TextField } from "@lenso/ui";
import { AnimalPicker } from "./required--shared";
import { styles } from "../../en/combo-box/styles.stylex";
export function AnimalForm({ secondary = false }: { secondary?: boolean }) {
  return (
    <Form
      xstyle={[styles.form, secondary && styles.fullWidth]}
      onSubmit={(event) => {
        event.preventDefault();
        new FormData(event.currentTarget);
        alert("表单提交成功！");
      }}
    >
      <TextField name="animal">
        <AnimalPicker required name="animal" fullWidth secondary={secondary} />
        <FieldError />
      </TextField>
      <Button type="submit">提交</Button>
    </Form>
  );
}
export function Required() {
  return <AnimalForm />;
}
