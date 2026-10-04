// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { exampleStyles, SelectExample } from "../../en/select/select-example";
const choices = [
  {
    value: "option1",
    label: "选项 1",
  },
  {
    value: "option2",
    label: "选项 2",
  },
];
export function Variants() {
  return (
    <div {...stylex.props(exampleStyles.stack)}>
      <SelectExample label="主要变体" choices={choices} variant="primary" />
      <SelectExample label="次要变体" choices={choices} variant="secondary" />
    </div>
  );
}
