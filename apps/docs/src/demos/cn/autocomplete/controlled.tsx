"use client";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles, type Option } from "../../en/autocomplete/_native";
export const controlledStates = [
  {
    id: "california",
    name: "California",
  },
  {
    id: "texas",
    name: "Texas",
  },
  {
    id: "florida",
    name: "Florida",
  },
  {
    id: "new-york",
    name: "New York",
  },
  {
    id: "illinois",
    name: "Illinois",
  },
  {
    id: "pennsylvania",
    name: "Pennsylvania",
  },
];
export function Controlled() {
  const [state, setState] = useState<Option | Option[] | null>(controlledStates[0] ?? null);
  return (
    <div {...stylex.props(styles.stack)}>
      <NativeAutocomplete
        items={controlledStates}
        label="州（受控）"
        placeholder="选择一个州"
        searchLabel="Search states"
        value={state}
        onValueChange={setState}
      />
      <p {...stylex.props(styles.muted)}>
        已选：{state && !Array.isArray(state) ? state.name : "无"}
      </p>
    </div>
  );
}
