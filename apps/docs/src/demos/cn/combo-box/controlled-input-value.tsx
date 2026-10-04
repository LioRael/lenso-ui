// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker } from "../../en/combo-box/shared";
import { styles } from "../../en/combo-box/styles.stylex";
export function ControlledInputValue() {
  const [inputValue, setInputValue] = useState("");
  return (
    <div {...stylex.props(styles.column)}>
      <AnimalPicker
        label="搜索（受控输入）"
        placeholder="输入以搜索…"
        inputValue={inputValue}
        onInputValueChange={setInputValue}
      />
      <p {...stylex.props(styles.muted)}>输入值：{inputValue || "（空）"}</p>
    </div>
  );
}
