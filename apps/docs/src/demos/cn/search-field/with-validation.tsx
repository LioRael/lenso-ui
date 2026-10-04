// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, FieldError, Label, SearchField } from "@lenso/ui";
import * as React from "react";
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
export function WithValidation() {
  const [value, setValue] = React.useState("");
  const isInvalid = value.length > 0 && value.length < 3;
  return (
    <div {...stylex.props(styles.root)}>
      <SearchField invalid={isInvalid} name="search">
        <Label>搜索</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input
            required
            xstyle={styles.input}
            placeholder="搜索…"
            value={value}
            onValueChange={setValue}
          />
          <SearchField.ClearButton />
        </SearchField.Group>
        {isInvalid ? (
          <FieldError match>搜索内容至少需要 3 个字符</FieldError>
        ) : (
          <Description
            style={{
              display: "block",
            }}
          >
            请输入至少 3 个字符后再搜索
          </Description>
        )}
      </SearchField>
    </div>
  );
}
