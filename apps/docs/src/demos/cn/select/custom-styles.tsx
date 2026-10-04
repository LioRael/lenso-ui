// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
import { SelectExample } from "../../en/select/select-example";
export function CustomStyles() {
  return (
    <SelectExample
      custom
      label="套餐"
      placeholder="选择套餐"
      variant="secondary"
      choices={[
        {
          value: "free",
          label: "免费",
        },
        {
          value: "pro",
          label: "专业版",
        },
      ]}
    />
  );
}
