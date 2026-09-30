"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { SelectExample, states } from "./select-example";
export function WithDescription() {
  return (
    <SelectExample label="State" choices={states} description="Select your state of residence" />
  );
}
