"use client";

// Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
import { SelectExample } from "../../en/select/select-example";
const animals = ["Dog", "Cat", "Bird", "Kangaroo", "Elephant", "Tiger"].map((label) => ({
  label,
  value: label.toLowerCase(),
  disabled: label === "Cat" || label === "Kangaroo",
}));
export function WithDisabledOptions() {
  return <SelectExample label="动物" placeholder="请选择动物" choices={animals} />;
}
