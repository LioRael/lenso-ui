"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { controlledStates, exampleStyles, SelectExample } from "./select-example";
export function ControlledMultiple() {
  const [selected, setSelected] = useState<string[]>(["california", "texas"]);
  return (
    <div {...stylex.props(exampleStyles.stack)}>
      <SelectExample
        multiple
        label="States (controlled multiple)"
        choices={controlledStates}
        placeholder="Select states"
        value={selected}
        onValueChange={setSelected}
      />
      <p {...stylex.props(exampleStyles.note)}>
        Selected: {selected.length > 0 ? selected.join(", ") : "None"}
      </p>
    </div>
  );
}
