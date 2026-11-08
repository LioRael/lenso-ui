"use client";
import { Label, SearchField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ input: { width: 280 } });
export function RenderFunction() {
  return (
    <SearchField name="search" render={(props) => <div {...props} data-custom="foo" />}>
      <Label>Search</Label>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input xstyle={styles.input} placeholder="Search..." />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
