"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "./_native";
const tags = [
  { id: "react", name: "React" },
  { id: "typescript", name: "TypeScript" },
  { id: "javascript", name: "JavaScript" },
  { id: "nodejs", name: "Node.js" },
  { id: "python", name: "Python" },
  { id: "vue", name: "Vue" },
  { id: "angular", name: "Angular" },
  { id: "nextjs", name: "Next.js" },
];
export function TagGroupSelection() {
  return (
    <NativeAutocomplete
      items={tags}
      label="Tags"
      placeholder="Select tags"
      multiple
      chips
      searchLabel="Search tags"
      searchPlaceholder="Search tags..."
      emptyText="No tags found"
    />
  );
}
