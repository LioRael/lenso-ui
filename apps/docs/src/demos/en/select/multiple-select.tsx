"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { countries, SelectExample } from "./select-example";
export function MultipleSelect() {
  return (
    <SelectExample
      multiple
      label="Countries to Visit"
      placeholder="Select countries"
      choices={countries}
    />
  );
}
