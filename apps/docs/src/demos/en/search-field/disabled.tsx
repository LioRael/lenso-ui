"use client";
import { Description, Label, SearchField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 16 },
  input: { width: 280 },
});
export function Disabled() {
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField disabled name="search">
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            xstyle={styles.input}
            value="Disabled search"
            placeholder="Search..."
          />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>This search field is disabled</Description>
      </SearchField>
      <SearchField disabled name="search-empty">
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="Search..." />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>This search field is disabled</Description>
      </SearchField>
    </div>
  );
}
