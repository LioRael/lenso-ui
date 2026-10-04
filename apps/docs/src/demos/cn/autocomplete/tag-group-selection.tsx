// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { NativeAutocomplete } from "../../en/autocomplete/_native";
const tags = [
  {
    id: "react",
    name: "React",
  },
  {
    id: "typescript",
    name: "TypeScript",
  },
  {
    id: "javascript",
    name: "JavaScript",
  },
  {
    id: "nodejs",
    name: "Node.js",
  },
  {
    id: "python",
    name: "Python",
  },
  {
    id: "vue",
    name: "Vue",
  },
  {
    id: "angular",
    name: "Angular",
  },
  {
    id: "nextjs",
    name: "Next.js",
  },
];
export function TagGroupSelection() {
  return (
    <NativeAutocomplete
      items={tags}
      label="标签"
      placeholder="选择标签"
      multiple
      chips
      searchLabel="Search tags"
      searchPlaceholder="Search tags..."
      emptyText="No tags found"
    />
  );
}
