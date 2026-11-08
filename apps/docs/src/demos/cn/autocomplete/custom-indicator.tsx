"use client";

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
