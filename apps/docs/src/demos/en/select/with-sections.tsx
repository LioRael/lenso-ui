"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { countrySections, SelectExample } from "./select-example";
export function WithSections() {
  return (
    <SelectExample
      label="Country"
      placeholder="Select a country"
      choices={countrySections.flatMap((section) => section.items)}
      sections={countrySections}
    />
  );
}
