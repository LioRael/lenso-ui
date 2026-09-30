"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Label, SearchField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { width: "100%", maxWidth: 256 },
  label: { fontWeight: 500, color: "var(--foreground)" },
  group: { borderRadius: 12, backgroundColor: "var(--default)" },
  muted: { color: "var(--muted)" },
  input: { "::placeholder": { color: "var(--muted)" } },
});
export function CustomStyles() {
  return (
    <SearchField xstyle={styles.root} name="docs" variant="secondary">
      <Label xstyle={styles.label}>Search docs</Label>
      <SearchField.Group xstyle={styles.group}>
        <SearchField.SearchIcon xstyle={styles.muted} />
        <SearchField.Input xstyle={styles.input} placeholder="Components, guides..." />
        <SearchField.ClearButton xstyle={styles.muted} />
      </SearchField.Group>
    </SearchField>
  );
}
