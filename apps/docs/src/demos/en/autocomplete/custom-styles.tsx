"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "./_native";
const teammates = [
  { id: "sarah", name: "Sarah Chen", role: "Product Design" },
  { id: "marcus", name: "Marcus Lee", role: "Engineering" },
  { id: "priya", name: "Priya Patel", role: "Data Science" },
  { id: "jordan", name: "Jordan Kim", role: "Customer Success" },
  { id: "alex", name: "Alex Rivera", role: "Marketing" },
];
export function CustomStyles() {
  return (
    <NativeAutocomplete
      items={teammates}
      label="Assignees"
      description="People who will be notified when this task updates."
      placeholder="Search teammates..."
      searchLabel="Search by name or role"
      searchPlaceholder="Search by name or role..."
      multiple
      chips
      custom
      emptyText="No teammates found"
    />
  );
}
