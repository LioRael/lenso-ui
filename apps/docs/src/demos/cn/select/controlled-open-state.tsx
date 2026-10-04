// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { exampleStyles, SelectExample, states } from "./controlled-open-state--select-example";
export function ControlledOpenState() {
  const [open, setOpen] = useState(false);
  return (
    <div {...stylex.props(exampleStyles.stack)}>
      <SelectExample label="州" choices={states} open={open} onOpenChange={setOpen} />
      <button type="button" {...stylex.props(exampleStyles.action)} onClick={() => setOpen(!open)}>
        {open ? "关闭" : "打开"}选择框
      </button>
      <p {...stylex.props(exampleStyles.note)}>选择框{open ? "已打开" : "已关闭"}</p>
    </div>
  );
}
