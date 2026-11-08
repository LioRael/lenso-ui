import { defineStory } from "./story";
import { SectionIndexStory } from "./section-index";
export const story = defineStory({
  displayName: "SectionIndex",
  Component: SectionIndexStory,
  args: [{ variant: "Produce sections", initial: { disabled: false } }],
});
