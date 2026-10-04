// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "../../en/autocomplete/_native";
const animals = [
  {
    id: "dog",
    name: "Dog",
  },
  {
    id: "cat",
    name: "Cat",
    disabled: true,
  },
  {
    id: "bird",
    name: "Bird",
  },
  {
    id: "kangaroo",
    name: "Kangaroo",
    disabled: true,
  },
  {
    id: "elephant",
    name: "Elephant",
  },
  {
    id: "tiger",
    name: "Tiger",
  },
];
export function WithDisabledOptions() {
  return (
    <NativeAutocomplete
      items={animals}
      label="动物"
      placeholder="选择一种动物"
      searchLabel="Search animals"
      searchPlaceholder="Search animals..."
    />
  );
}
