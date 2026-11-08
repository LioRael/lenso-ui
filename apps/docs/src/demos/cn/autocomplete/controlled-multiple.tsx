"use client";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, styles, type Option } from "../../en/autocomplete/_native";
import { controlledStates } from "./controlled";
export function ControlledMultiple() {
  const [selected, setSelected] = useState<Option | Option[] | null>(() =>
    controlledStates.slice(0, 2),
  );
  return (
    <div {...stylex.props(styles.stack)}>
      <NativeAutocomplete
        items={controlledStates}
        label="州"
        placeholder="选择州"
        multiple
        value={selected}
        onValueChange={setSelected}
        searchLabel="Search states"
      />
      <p {...stylex.props(styles.muted)}>
        已选：{" "}
        {Array.isArray(selected) && selected.length
          ? selected.map((item) => item.id).join(", ")
          : "无"}
      </p>
    </div>
  );
}
