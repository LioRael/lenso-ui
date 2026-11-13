"use client";
import { AnimalPicker, smallAnimals } from "./shared";
export function CustomFiltering() {
  return (
    <AnimalPicker
      label="Animal (custom filter)"
      items={smallAnimals.map((value) => ({ value, label: value.name }))}
      filter={(animal, inputValue) =>
        !inputValue || animal.value.name.toLowerCase().includes(inputValue.toLowerCase())
      }
    />
  );
}
