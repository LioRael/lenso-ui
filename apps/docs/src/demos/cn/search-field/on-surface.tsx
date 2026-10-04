// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Label, SearchField, Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    maxWidth: 384,
    flexDirection: "column",
    gap: 16,
    borderRadius: 24,
    padding: 24,
  },
  input: {
    width: "100%",
  },
});
export function OnSurface() {
  return (
    <Surface xstyle={styles.root}>
      <SearchField name="search" variant="secondary">
        <Label>搜索</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="搜索…" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>输入关键词进行搜索</Description>
      </SearchField>
      <SearchField name="search-2" variant="secondary">
        <Label>高级搜索</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="高级搜索…" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>使用筛选条件细化搜索</Description>
      </SearchField>
    </Surface>
  );
}
