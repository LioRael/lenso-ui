"use client";
// HeroUI v3.2.6, Apache-2.0. Native defaultValue replaces defaultSelectedKey.
import { AnimalPicker, animals } from "./shared";
export function DefaultSelectedKey() {
  return <AnimalPicker defaultValue={animals[1]} />;
}
