"use client";
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
