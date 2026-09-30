"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Input, Surface, TextArea } from "@lenso/ui";
import { s } from "../card/display.stylex";

export function WithFormComponents() {
  return (
    <Surface xstyle={s.surfaceForm} variant="default">
      <Input
        aria-label="Input with secondary variant"
        placeholder="Input with secondary variant"
        variant="secondary"
      />
      <TextArea
        aria-label="TextArea with secondary variant"
        placeholder="TextArea with secondary variant"
        variant="secondary"
      />
    </Surface>
  );
}
