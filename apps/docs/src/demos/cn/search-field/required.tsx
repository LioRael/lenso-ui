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
export function Required() {
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField name="search">
        <Label>搜索</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input required xstyle={styles.input} placeholder="搜索…" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      <SearchField name="search-query">
        <Label>搜索内容</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input required xstyle={styles.input} placeholder="输入搜索内容…" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>至少需要 3 个字符</Description>
      </SearchField>
    </div>
  );
}
