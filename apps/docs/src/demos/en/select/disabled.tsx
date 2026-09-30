"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { countries, exampleStyles, SelectExample, states } from "./select-example";
export function Disabled() {
  return (
    <div {...stylex.props(exampleStyles.stack)}>
      <SelectExample disabled label="State" choices={states} defaultValue="california" />
      <SelectExample
        disabled
        multiple
        label="Countries to Visit"
        choices={countries.slice(0, 6)}
        placeholder="Select countries"
        defaultValue={["argentina", "japan", "france"]}
      />
    </div>
  );
}
