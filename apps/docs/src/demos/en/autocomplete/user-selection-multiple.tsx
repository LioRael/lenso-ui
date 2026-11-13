"use client";
import { OptionPicker } from "./_native";
import { users } from "./user-selection";
export function UserSelectionMultiple() {
  return (
    <OptionPicker
      items={users}
      label="Users"
      placeholder="Select your teammates"
      multiple
      chips
      searchLabel="Search users"
      searchPlaceholder="Search users..."
    />
  );
}
