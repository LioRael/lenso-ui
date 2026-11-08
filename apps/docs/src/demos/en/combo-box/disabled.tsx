"use client";
import { AnimalPicker, animals } from "./shared";
export function Disabled() {
  return <AnimalPicker disabled defaultValue={animals[1]} />;
}
