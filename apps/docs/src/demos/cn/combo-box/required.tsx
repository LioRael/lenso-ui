// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6, Apache-2.0. Base Field context owns validation and error linkage.
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
