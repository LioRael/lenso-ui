"use client";

// Native defaultValue replaces defaultSelectedKey.
import { AnimalPicker, animals } from "./default-selected-key--shared";
export function DefaultSelectedKey() {
  return <AnimalPicker defaultValue={animals[1]} />;
}
