"use client";

import { AnimalPicker, smallAnimals } from "../../en/combo-box/shared";
export function CustomFiltering() {
  return (
    <AnimalPicker
      label="动物（自定义筛选）"
      items={smallAnimals}
      filter={(animal, inputValue) =>
        !inputValue || animal.name.toLowerCase().includes(inputValue.toLowerCase())
      }
    />
  );
}
