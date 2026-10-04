// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import {
  controlledStates,
  exampleStyles,
  SelectExample,
} from "./controlled-multiple--select-example";
export function ControlledMultiple() {
  const [selected, setSelected] = useState<string[]>(["california", "texas"]);
  return (
    <div {...stylex.props(exampleStyles.stack)}>
      <SelectExample
        multiple
        label="州（受控多选）"
        choices={controlledStates}
        placeholder="请选择州"
        value={selected}
        onValueChange={setSelected}
      />
      <p {...stylex.props(exampleStyles.note)}>
        已选：{selected.length > 0 ? selected.join(", ") : "无"}
      </p>
    </div>
  );
}
