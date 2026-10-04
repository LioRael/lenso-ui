// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { countries, exampleStyles, SelectExample, states } from "./disabled--select-example";
export function Disabled() {
  return (
    <div {...stylex.props(exampleStyles.stack)}>
      <SelectExample disabled label="州" choices={states} defaultValue="california" />
      <SelectExample
        disabled
        multiple
        label="拟访问国家"
        choices={countries.slice(0, 6)}
        placeholder="请选择国家"
        defaultValue={["argentina", "japan", "france"]}
      />
    </div>
  );
}
