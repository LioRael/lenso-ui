"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Button, Description, Label, SearchField } from "@lenso/ui";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 16 },
  actions: { display: "flex", gap: 8 },
  input: { width: 280 },
});
export function Controlled() {
  const [value, setValue] = React.useState("");
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField name="search">
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            xstyle={styles.input}
            placeholder="Search..."
            value={value}
            onValueChange={setValue}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>Current value: {value || "(empty)"}</Description>
      </SearchField>
      <div {...stylex.props(styles.actions)}>
        <Button variant="tertiary" onClick={() => setValue("")}>
          Clear
        </Button>
        <Button variant="tertiary" onClick={() => setValue("example query")}>
          Set example
        </Button>
      </div>
    </div>
  );
}
