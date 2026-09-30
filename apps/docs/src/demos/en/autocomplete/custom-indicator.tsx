"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { ChevronsExpandVertical } from "@gravity-ui/icons";
import { NativeAutocomplete } from "./_native";
import { states } from "./default";
export function CustomIndicator() {
  return (
    <NativeAutocomplete
      items={states}
      label="State"
      searchLabel="Search states"
      indicator={<ChevronsExpandVertical width={12} height={12} />}
    />
  );
}
