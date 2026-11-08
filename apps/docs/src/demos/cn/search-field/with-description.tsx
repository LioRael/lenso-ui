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
export function WithDescription() {
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField name="search">
        <Label>搜索产品</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="搜索产品…" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>输入关键词进行搜索 for products</Description>
      </SearchField>
      <SearchField name="search-users">
        <Label>搜索用户</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="搜索用户…" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>按姓名、邮箱或用户名搜索</Description>
      </SearchField>
    </div>
  );
}
