"use client";

import { NativeAutocomplete } from "../../en/autocomplete/_native";
import { states } from "./default";
export function WithDescription() {
  return (
    <NativeAutocomplete
      items={states}
      label="州"
      searchLabel="Search states"
      searchPlaceholder="Search states..."
      description="请选择你的居住州"
    />
  );
}
