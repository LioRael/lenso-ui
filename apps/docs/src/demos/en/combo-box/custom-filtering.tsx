"use client";
// HeroUI v3.2.6, Apache-2.0.
import { AnimalPicker, smallAnimals } from "./shared";
export function CustomFiltering() {
  return (
    <AnimalPicker
      label="Animal (custom filter)"
      items={smallAnimals}
      filter={(animal, inputValue) =>
        !inputValue || animal.name.toLowerCase().includes(inputValue.toLowerCase())
      }
    />
  );
}
