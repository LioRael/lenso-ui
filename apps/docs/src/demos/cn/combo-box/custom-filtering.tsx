// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6, Apache-2.0.
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
