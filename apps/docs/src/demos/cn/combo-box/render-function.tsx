"use client";

// Base UI Root is non-DOM; compose its native InputGroup.
import { AnimalPicker } from "./render-function--shared";
export function RenderFunction() {
  return <AnimalPicker composed />;
}
