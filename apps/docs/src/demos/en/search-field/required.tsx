"use client";
import { Description, Label, SearchField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 16 },
  input: { width: 280 },
});
export function Required() {
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField name="search">
        <Label>Search</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input required xstyle={styles.input} placeholder="Search..." />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      <SearchField name="search-query">
        <Label>Search query</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input required xstyle={styles.input} placeholder="Enter search query..." />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>Minimum 3 characters required</Description>
      </SearchField>
    </div>
  );
}
