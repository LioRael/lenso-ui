"use client";

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
        query={inputValue}
        onQueryChange={setInputValue}
      />
      <p {...stylex.props(styles.muted)}>输入值：{inputValue || "（空）"}</p>
    </div>
  );
}
