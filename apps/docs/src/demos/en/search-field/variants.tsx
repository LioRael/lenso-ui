"use client";
import { Label, SearchField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 16 },
  input: { width: 280 },
});
export function Variants() {
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField name="primary-search" variant="primary">
        <Label>Primary variant</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="Search..." />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      <SearchField name="secondary-search" variant="secondary">
        <Label>Secondary variant</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="Search..." />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
    </div>
  );
}
