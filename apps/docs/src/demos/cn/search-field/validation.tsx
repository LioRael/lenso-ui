// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { FieldError, Label, SearchField } from "@lenso/ui";
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
export function Validation() {
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField invalid name="search">
        <Label>搜索</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input required value="ab" xstyle={styles.input} placeholder="搜索…" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <FieldError match>搜索内容至少需要 3 个字符</FieldError>
      </SearchField>
      <SearchField invalid name="search-invalid">
        <Label>搜索</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input xstyle={styles.input} placeholder="搜索…" value="invalid@query" />
          <SearchField.ClearButton />
        </SearchField.Group>
        <FieldError match>搜索内容包含无效字符</FieldError>
      </SearchField>
    </div>
  );
}
