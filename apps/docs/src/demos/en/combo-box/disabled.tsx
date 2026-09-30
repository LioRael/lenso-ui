"use client";
// HeroUI v3.2.6, Apache-2.0.
import { AnimalPicker, animals } from "./shared";
export function Disabled() {
  return <AnimalPicker disabled defaultValue={animals[1]} />;
}
