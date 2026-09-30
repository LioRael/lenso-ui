"use client";
/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { SelectExample } from "./select-example";
const animals = ["Dog", "Cat", "Bird", "Kangaroo", "Elephant", "Tiger"].map((label) => ({
  label,
  value: label.toLowerCase(),
  disabled: label === "Cat" || label === "Kangaroo",
}));
export function WithDisabledOptions() {
  return <SelectExample label="Animal" placeholder="Select an animal" choices={animals} />;
}
