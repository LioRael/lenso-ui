"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. Native form and Base UI button retain the source submit workflow. */
import { Button, ColorField, ColorSwatch } from "@lenso/ui";
import type { Color } from "@lenso/ui";
import { useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function FormExample() {
  const [value, setValue] = useState<Color | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value || isSubmitting) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setValue(null);
      setIsSubmitting(false);
    }, 1500);
  }
  return (
    <form {...stylex.props(styles.column, styles.width280)} onSubmit={handleSubmit}>
      <ColorField
        fullWidth
        isRequired
        xstyle={styles.full}
        name="brand-color"
        value={value}
        onChange={setValue}
      >
        <ColorField.Label>Brand Color</ColorField.Label>
        <ColorField.Group>
          <ColorField.Prefix>
            <ColorSwatch color={value ?? undefined} size="xs" />
          </ColorField.Prefix>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
        <ColorField.Description>Choose your brand's primary color</ColorField.Description>
      </ColorField>
      <Button
        xstyle={styles.full}
        disabled={!value}
        isLoading={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? "Saving..." : "Save Color"}
      </Button>
    </form>
  );
}
