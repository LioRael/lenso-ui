"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { controlledStates, exampleStyles, SelectExample } from "./select-example";
export function Controlled() {
  const [state, setState] = useState<string | null>("california");
  return (
    <div {...stylex.props(exampleStyles.compactStack)}>
      <SelectExample
        label="State (controlled)"
        choices={controlledStates}
        placeholder="Select a state"
        value={state}
        onValueChange={setState}
      />
      <p {...stylex.props(exampleStyles.note)}>
        Selected: {controlledStates.find((item) => item.value === state)?.label || "None"}
      </p>
    </div>
  );
}
