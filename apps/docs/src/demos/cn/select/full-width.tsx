// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { exampleStyles, SelectExample } from "../../en/select/select-example";
export function FullWidth() {
  return (
    <div {...stylex.props(exampleStyles.wide, exampleStyles.stack)}>
      <SelectExample
        fluid
        label="喜爱的动物"
        choices={["Cat", "Dog", "Bird"].map((label) => ({
          label,
          value: label.toLowerCase(),
        }))}
      />
    </div>
  );
}
