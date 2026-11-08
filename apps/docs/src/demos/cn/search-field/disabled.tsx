"use client";

import { Description, Label, SearchField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  input: {
    width: 280,
  },
});
export function Disabled() {
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField disabled name="search">
        <Label>搜索</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} value="Disabled search" placeholder="搜索…" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>此搜索框已禁用</Description>
      </SearchField>
      <SearchField disabled name="search-empty">
        <Label>搜索</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="搜索…" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>此搜索框已禁用</Description>
      </SearchField>
    </div>
  );
}
