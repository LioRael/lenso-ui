"use client";

import { ChevronsExpandVertical } from "@gravity-ui/icons";
import { OptionPicker } from "../../en/autocomplete/_native";
import { states } from "../../en/autocomplete/default";
export function CustomIndicator() {
  return (
    <OptionPicker
      items={states}
      label="州"
      searchLabel="Search states"
      indicator={<ChevronsExpandVertical width={12} height={12} />}
    />
  );
}
