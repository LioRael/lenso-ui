"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "./_native";
export function AllowsEmptyCollection() {
  return (
    <NativeAutocomplete
      items={[]}
      label="State"
      searchLabel="Search states"
      searchPlaceholder="Search states..."
    />
  );
}
