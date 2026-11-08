"use client";

// Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
import { ChevronsExpandVertical } from "@gravity-ui/icons";
import { SelectExample, states } from "./custom-indicator--select-example";
export function CustomIndicator() {
  return (
    <SelectExample
      label="州"
      choices={states}
      indicator={<ChevronsExpandVertical width={12} height={12} aria-hidden="true" />}
    />
  );
}
