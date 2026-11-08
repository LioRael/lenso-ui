"use client";

// Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
import { countries, SelectExample } from "./multiple-select--select-example";
export function MultipleSelect() {
  return <SelectExample multiple label="拟访问国家" placeholder="请选择国家" choices={countries} />;
}
