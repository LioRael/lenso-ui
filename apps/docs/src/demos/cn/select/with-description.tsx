"use client";

// Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
import { SelectExample, states } from "./with-description--select-example";
export function WithDescription() {
  return <SelectExample label="州" choices={states} description="请选择居住州" />;
}
