// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "../../en/autocomplete/_native";
const teammates = [
  {
    id: "sarah",
    name: "Sarah Chen",
    role: "Product Design",
  },
  {
    id: "marcus",
    name: "Marcus Lee",
    role: "Engineering",
  },
  {
    id: "priya",
    name: "Priya Patel",
    role: "Data Science",
  },
  {
    id: "jordan",
    name: "Jordan Kim",
    role: "Customer Success",
  },
  {
    id: "alex",
    name: "Alex Rivera",
    role: "Marketing",
  },
];
export function CustomStyles() {
  return (
    <NativeAutocomplete
      items={teammates}
      label="负责人"
      description="任务更新时将通知以下人员。"
      placeholder="搜索团队成员..."
      searchLabel="Search by name or role"
      searchPlaceholder="Search by name or role..."
      multiple
      chips
      custom
      emptyText="No teammates found"
    />
  );
}
