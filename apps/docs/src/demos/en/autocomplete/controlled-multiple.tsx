"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles, type Option } from "./_native";
import { controlledStates } from "./controlled";
export function ControlledMultiple() {
  const [selected, setSelected] = useState<Option | Option[] | null>(() =>
    controlledStates.slice(0, 2),
  );
  return (
    <div {...stylex.props(styles.stack)}>
      <NativeAutocomplete
        items={controlledStates}
        label="States"
        placeholder="Select states"
        multiple
        value={selected}
        onValueChange={setSelected}
        searchLabel="Search states"
      />
      <p {...stylex.props(styles.muted)}>
        Selected:{" "}
        {Array.isArray(selected) && selected.length
          ? selected.map((item) => item.id).join(", ")
          : "None"}
      </p>
    </div>
  );
}
