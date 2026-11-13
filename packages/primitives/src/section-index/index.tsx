"use client";
import { createParts, type Parts } from "@ui-sdk/react/primitive";
import { sectionIndex } from "./section-index.js";
const tags = { root: "nav", item: "a" } as const;
export const SectionIndex: Parts<typeof sectionIndex, typeof tags> = createParts(
  sectionIndex,
  tags,
);
export { sectionIndex, createSectionIndexController } from "./section-index.js";
export type {
  SectionIndexOptions,
  SectionIndexItem,
  SectionIndexController,
  SectionIndexReason,
} from "./section-index.js";
