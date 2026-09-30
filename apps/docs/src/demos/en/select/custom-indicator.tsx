"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { ChevronsExpandVertical } from "@gravity-ui/icons";
import { SelectExample, states } from "./select-example";
export function CustomIndicator() {
  return (
    <SelectExample
      label="State"
      choices={states}
      indicator={<ChevronsExpandVertical width={12} height={12} aria-hidden="true" />}
    />
  );
}
