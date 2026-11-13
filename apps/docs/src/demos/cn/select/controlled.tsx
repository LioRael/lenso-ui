"use client";

// Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
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
        onValueChange={(next) => {
          if (!Array.isArray(next)) setState(next);
        }}
      />
      <p {...stylex.props(exampleStyles.note)}>
        已选：{controlledStates.find((item) => item.value === state)?.label || "无"}
      </p>
    </div>
  );
}
