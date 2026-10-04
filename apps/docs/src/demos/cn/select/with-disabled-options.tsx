// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { SelectExample } from "../../en/select/select-example";
const animals = ["Dog", "Cat", "Bird", "Kangaroo", "Elephant", "Tiger"].map((label) => ({
  label,
  value: label.toLowerCase(),
  disabled: label === "Cat" || label === "Kangaroo",
}));
export function WithDisabledOptions() {
  return <SelectExample label="动物" placeholder="请选择动物" choices={animals} />;
}
