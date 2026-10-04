// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "../../en/autocomplete/_native";
export const states = [
  {
    id: "florida",
    name: "Florida",
  },
  {
    id: "delaware",
    name: "Delaware",
  },
  {
    id: "california",
    name: "California",
  },
  {
    id: "texas",
    name: "Texas",
  },
  {
    id: "new-york",
    name: "New York",
  },
  {
    id: "washington",
    name: "Washington",
  },
];
export default function Default() {
  return (
    <NativeAutocomplete
      items={states}
      label="计划前往的州"
      placeholder="选择州/省"
      multiple
      chips
      hideClear
    />
  );
}
