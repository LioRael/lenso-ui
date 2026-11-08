"use client";
import { NativeAutocomplete } from "./_native";
import { users } from "./user-selection";
export function UserSelectionMultiple() {
  return (
    <NativeAutocomplete
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
