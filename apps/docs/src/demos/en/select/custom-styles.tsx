"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { SelectExample } from "./select-example";
export function CustomStyles() {
  return (
    <SelectExample
      custom
      label="Plan"
      placeholder="Pick a plan"
      variant="secondary"
      choices={[
        { value: "free", label: "Free" },
        { value: "pro", label: "Pro" },
      ]}
    />
  );
}
