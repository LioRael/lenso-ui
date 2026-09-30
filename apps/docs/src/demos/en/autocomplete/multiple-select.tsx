"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "./_native";
import { controlledStates } from "./controlled";
export function MultipleSelect() {
  return (
    <NativeAutocomplete
      items={controlledStates}
      label="States"
      placeholder="Select states"
      multiple
      chips
    />
  );
}
