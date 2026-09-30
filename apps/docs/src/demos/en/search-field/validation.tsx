"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { FieldError, Label, SearchField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 16 },
  input: { width: 280 },
});
export function Validation() {
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField invalid name="search">
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input required value="ab" xstyle={styles.input} placeholder="Search..." />
          <SearchField.ClearButton />
        </SearchField.Group>
        <FieldError match>Search query must be at least 3 characters</FieldError>
      </SearchField>
      <SearchField invalid name="search-invalid">
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="Search..." value="invalid@query" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <FieldError match>Invalid characters in search query</FieldError>
      </SearchField>
    </div>
  );
}
