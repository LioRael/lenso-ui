"use client";

import { Label, SearchField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  input: {
    width: 280,
  },
});
export function Basic() {
  return (
    <SearchField name="search">
      <Label>搜索</Label>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input xstyle={styles.input} placeholder="搜索…" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
