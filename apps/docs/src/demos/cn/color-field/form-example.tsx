// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. Native form and Base UI button retain the source submit workflow. */
import { Button, ColorField, ColorSwatch } from "@lenso/ui";
import type { Color } from "@lenso/ui";
import { useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
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
        <ColorField.Label>品牌色</ColorField.Label>
        <ColorField.Group>
          <ColorField.Prefix>
            <ColorSwatch color={value ?? undefined} size="xs" />
          </ColorField.Prefix>
          <ColorField.Input placeholder="#000000" />
        </ColorField.Group>
        <ColorField.Description>选择品牌主色</ColorField.Description>
      </ColorField>
      <Button
        xstyle={styles.full}
        disabled={!value}
        isLoading={isSubmitting}
        type="submit"
        variant="primary"
      >
        {isSubmitting ? "保存中…" : "保存颜色"}
      </Button>
    </form>
  );
}
