"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { useState } from "react";
import { SelectExample, states } from "./select-example";
export function WithClearButton() {
  const [value, setValue] = useState<string | null>("california");
  return (
    <SelectExample
      label="State"
      choices={states}
      value={value}
      onValueChange={setValue}
      clear={value === null ? undefined : () => setValue(null)}
    />
  );
}
