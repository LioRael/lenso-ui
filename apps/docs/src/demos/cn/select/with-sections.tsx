"use client";

// Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
import { countrySections, SelectExample } from "./with-sections--select-example";
export function WithSections() {
  return (
    <SelectExample
      label="国家"
      placeholder="请选择国家"
      choices={countrySections.flatMap((section) => section.items)}
      sections={countrySections}
    />
  );
}
