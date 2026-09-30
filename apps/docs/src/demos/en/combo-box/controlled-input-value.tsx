"use client";
// HeroUI v3.2.6, Apache-2.0.
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
        inputValue={inputValue}
        onInputValueChange={setInputValue}
      />
      <p {...stylex.props(styles.muted)}>Input value: {inputValue || "(empty)"}</p>
    </div>
  );
}
