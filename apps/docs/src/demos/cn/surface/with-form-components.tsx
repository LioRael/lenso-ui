// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Input, Surface, TextArea } from "@lenso/ui";
import { s } from "../../en/card/display.stylex";
export function WithFormComponents() {
  return (
    <Surface xstyle={s.surfaceForm} variant="default">
      <Input
        aria-label="使用次要变体的输入框"
        placeholder="使用次要变体的输入框"
        variant="secondary"
      />
      <TextArea
        aria-label="使用次要变体的文本域"
        placeholder="使用次要变体的文本域"
        variant="secondary"
      />
    </Surface>
  );
}
