"use client";
// HeroUI v3.2.6, Apache-2.0. Native input retains free text independently of selection.
import { AnimalPicker } from "./shared";
export function AllowsCustomValue() {
  return (
    <AnimalPicker
      placeholder="Search or type an animal..."
      description="You can type any animal name, even if it's not in the list"
    />
  );
}
