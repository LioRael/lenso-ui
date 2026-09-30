"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "./_native";
const animals = [
  { id: "dog", name: "Dog" },
  { id: "cat", name: "Cat", disabled: true },
  { id: "bird", name: "Bird" },
  { id: "kangaroo", name: "Kangaroo", disabled: true },
  { id: "elephant", name: "Elephant" },
  { id: "tiger", name: "Tiger" },
];
export function WithDisabledOptions() {
  return (
    <NativeAutocomplete
      items={animals}
      label="Animal"
      placeholder="Select an animal"
      searchLabel="Search animals"
      searchPlaceholder="Search animals..."
    />
  );
}
