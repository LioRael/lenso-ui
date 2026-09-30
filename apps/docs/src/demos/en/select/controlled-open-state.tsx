"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { exampleStyles, SelectExample, states } from "./select-example";
export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(exampleStyles.stack)}>
      <SelectExample label="State" choices={states} open={open} onOpenChange={setOpen} />
      <button type="button" {...stylex.props(exampleStyles.action)} onClick={() => setOpen(!open)}>
        {open ? "Close" : "Open"} Select
      </button>
      <p {...stylex.props(exampleStyles.note)}>Select is {open ? "open" : "closed"}</p>
    </div>
  );
}
