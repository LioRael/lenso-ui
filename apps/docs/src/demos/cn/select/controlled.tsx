// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { controlledStates, exampleStyles, SelectExample } from "../../en/select/select-example";
export function Controlled() {
  const [state, setState] = useState<string | null>("california");
  return (
    <div {...stylex.props(exampleStyles.compactStack)}>
      <SelectExample
        label="州（受控）"
        choices={controlledStates}
        placeholder="请选择州"
        value={state}
        onValueChange={setState}
      />
      <p {...stylex.props(exampleStyles.note)}>
        已选：{controlledStates.find((item) => item.value === state)?.label || "无"}
      </p>
    </div>
  );
}
