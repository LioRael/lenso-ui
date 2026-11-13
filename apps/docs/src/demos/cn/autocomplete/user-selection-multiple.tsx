"use client";

import { OptionPicker } from "../../en/autocomplete/_native";
import { users } from "./user-selection";
export function UserSelectionMultiple() {
  return (
    <OptionPicker
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
