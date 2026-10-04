// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6, Apache-2.0. Opening policies use native controlled open events.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker } from "./menu-trigger--shared";
import { styles } from "../../en/combo-box/styles.stylex";
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
        {mode === "focus" ? "聚焦（默认）" : mode === "input" ? "输入" : "手动"}
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
