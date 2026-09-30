"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles, type Option } from "./_native";
export const controlledStates = [
  { id: "california", name: "California" },
  { id: "texas", name: "Texas" },
  { id: "florida", name: "Florida" },
  { id: "new-york", name: "New York" },
  { id: "illinois", name: "Illinois" },
  { id: "pennsylvania", name: "Pennsylvania" },
];
export function Controlled() {
  const [state, setState] = useState<Option | Option[] | null>(controlledStates[0] ?? null);
  return (
    <div {...stylex.props(styles.stack)}>
      <NativeAutocomplete
        items={controlledStates}
        label="State (controlled)"
        placeholder="Select a state"
        searchLabel="Search states"
        value={state}
        onValueChange={setState}
      />
      <p {...stylex.props(styles.muted)}>
        Selected: {state && !Array.isArray(state) ? state.name : "None"}
      </p>
    </div>
  );
}
