"use client";
import { ChevronsExpandVertical } from "@gravity-ui/icons";
import { OptionPicker } from "./_native";
import { states } from "./default";
export function CustomIndicator() {
  return (
    <OptionPicker
      items={states}
      label="State"
      searchLabel="Search states"
      indicator={<ChevronsExpandVertical width={12} height={12} />}
    />
  );
}
