"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { exampleStyles, SelectExample } from "./select-example";
export function FullWidth() {
  return (
    <div {...stylex.props(exampleStyles.wide, exampleStyles.stack)}>
      <SelectExample
        fluid
        label="Favorite Animal"
        choices={["Cat", "Dog", "Bird"].map((label) => ({ label, value: label.toLowerCase() }))}
      />
    </div>
  );
}
