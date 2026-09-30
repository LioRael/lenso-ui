"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { exampleStyles, SelectExample } from "./select-example";
const choices = [
  { value: "option1", label: "Option 1" },
  { value: "option2", label: "Option 2" },
];
export function Variants() {
  return (
    <div {...stylex.props(exampleStyles.stack)}>
      <SelectExample label="Primary variant" choices={choices} variant="primary" />
      <SelectExample label="Secondary variant" choices={choices} variant="secondary" />
    </div>
  );
}
