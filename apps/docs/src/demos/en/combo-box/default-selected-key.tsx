"use client";
// Native defaultValue replaces defaultSelectedKey.
import { AnimalPicker, animals } from "./shared";
export function DefaultSelectedKey() {
  return <AnimalPicker defaultValue={animals[1]} />;
}
