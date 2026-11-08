"use client";

import { AnimalPicker, animals } from "./disabled--shared";
export function Disabled() {
  return <AnimalPicker disabled defaultValue={animals[1]} />;
}
