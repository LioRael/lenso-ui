"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, FieldError, Label, SearchField } from "@lenso/ui";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 16 },
  input: { width: 280 },
});
export function WithValidation() {
  const [value, setValue] = React.useState("");
  const isInvalid = value.length > 0 && value.length < 3;
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField invalid={isInvalid} name="search">
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            required
            xstyle={styles.input}
            placeholder="Search..."
            value={value}
            onValueChange={setValue}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
        {isInvalid ? (
          <FieldError match>Search query must be at least 3 characters</FieldError>
        ) : (
          <Description style={{ display: "block" }}>
            Enter at least 3 characters to search
          </Description>
        )}
      </SearchField>
    </div>
  );
}
