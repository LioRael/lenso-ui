// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "../../en/autocomplete/_native";
import { users } from "./user-selection";
export function UserSelectionMultiple() {
  return (
    <NativeAutocomplete
      items={users}
      label="用户"
      placeholder="选择队友"
      multiple
      chips
      searchLabel="Search users"
      searchPlaceholder="Search users..."
    />
  );
}
