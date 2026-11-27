import { sectionIndex } from "@lenso/primitives/section-index/core";
import { createParts, type Parts } from "@ui-sdk/svelte/primitive";

export const sectionIndexParts: Parts<typeof sectionIndex, { root: "nav"; item: "a" }> =
  createParts(sectionIndex, { root: "nav", item: "a" });
