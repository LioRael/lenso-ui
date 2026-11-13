"use client";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker } from "./shared";
import { styles } from "./styles.stylex";
export function ControlledInputValue() {
  const [inputValue, setInputValue] = useState("");
  return (
    <div {...stylex.props(styles.column)}>
      <AnimalPicker
        label="Search (controlled input)"
        placeholder="Type to search..."
        query={inputValue}
        onQueryChange={setInputValue}
      />
      <p {...stylex.props(styles.muted)}>Input value: {inputValue || "(empty)"}</p>
    </div>
  );
}
