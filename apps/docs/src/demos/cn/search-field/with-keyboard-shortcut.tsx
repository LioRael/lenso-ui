// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Kbd, Label, SearchField } from "@lenso/ui";
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
  hint: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "var(--default-500)",
  },
});
export function WithKeyboardShortcut() {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [value, setValue] = React.useState("");
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.shiftKey &&
        event.key === "S" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === inputRef.current)
        inputRef.current?.blur();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <div {...stylex.props(styles.root)}>
      <div>
        <SearchField name="search">
          <Label>搜索</Label>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              ref={inputRef}
              xstyle={styles.input}
              placeholder="搜索…"
              value={value}
              onValueChange={setValue}
            />
            <SearchField.ClearButton />
          </SearchField.Group>
          <Description>使用键盘快捷键快速聚焦此输入框</Description>
        </SearchField>
      </div>
      <div {...stylex.props(styles.hint)}>
        <span>按</span>
        <Kbd>
          <Kbd.Abbr keyValue="shift" />
          <Kbd.Content>S</Kbd.Content>
        </Kbd>
        <span>聚焦搜索框</span>
      </div>
    </div>
  );
}
