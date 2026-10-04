// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Label, NumberField, TextField } from "@lenso/ui";
import { styles } from "../../en/number-field/parts";
export function CustomStyles() {
  return (
    <TextField name="guests" xstyle={styles.guests}>
      <NumberField defaultValue={2} min={1} name="guests" variant="secondary">
        <Label xstyle={styles.label}>宾客</Label>
        <NumberField.Group xstyle={styles.customGroup}>
          <NumberField.DecrementButton xstyle={styles.customButton} />
          <NumberField.Input xstyle={styles.customInput} />
          <NumberField.IncrementButton xstyle={styles.customButton} />
        </NumberField.Group>
      </NumberField>
    </TextField>
  );
}
