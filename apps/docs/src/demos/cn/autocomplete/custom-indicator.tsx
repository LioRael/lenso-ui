// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { ChevronsExpandVertical } from "@gravity-ui/icons";
import { NativeAutocomplete } from "../../en/autocomplete/_native";
import { states } from "./default";
export function CustomIndicator() {
  return (
    <NativeAutocomplete
      items={states}
      label="州"
      searchLabel="Search states"
      indicator={<ChevronsExpandVertical width={12} height={12} />}
    />
  );
}
