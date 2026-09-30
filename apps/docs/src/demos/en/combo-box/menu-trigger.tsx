"use client";
// HeroUI v3.2.6, Apache-2.0. Opening policies use native controlled open events.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker } from "./shared";
import { styles } from "./styles.stylex";

function Policy({ mode }: { mode: "focus" | "input" | "manual" }) {
  const [open, setOpen] = useState(false);
  const description = {
    focus: "Popover opens when the input is focused",
    input: "Popover opens when the user edits the input text",
    manual: "Popover only opens when the trigger button is pressed or arrow keys are used",
  };
  return (
    <div {...stylex.props(styles.column)}>
      <p {...stylex.props(styles.caption)}>
        {mode === "focus" ? "Focus (default)" : mode === "input" ? "Input" : "Manual"}
      </p>
      <AnimalPicker
        open={open}
        openOnInputClick={mode === "focus"}
        inputFocus={mode === "focus" ? () => setOpen(true) : undefined}
        onOpenChange={(next, details) => {
          if (next && mode === "manual" && details.reason === "input-change") return;
          setOpen(next);
        }}
        description={description[mode]}
      />
    </div>
  );
}
export function MenuTrigger() {
  return (
    <div {...stylex.props(styles.menu)}>
      <Policy mode="focus" />
      <Policy mode="input" />
      <Policy mode="manual" />
    </div>
  );
}
