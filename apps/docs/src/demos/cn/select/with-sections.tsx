// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0 */
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
