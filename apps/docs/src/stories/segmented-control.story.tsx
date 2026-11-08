import { defineStory } from "./story";
import { SegmentedControlStory } from "./segmented-control";
const initial = {
  disabled: false,
  size: "sm" as const,
  glass: false,
  elastic: true,
  lift: 20,
  compareTabs: false,
};
export const story = defineStory({
  displayName: "SegmentedControl",
  Component: SegmentedControlStory,
  args: [
    { variant: "Message filter", initial: { ...initial } },
    { variant: "Large", initial: { ...initial, size: "lg" } },
    { variant: "Glass", initial: { ...initial, glass: true } },
    { variant: "Compare with Tabs", initial: { ...initial, compareTabs: true } },
  ],
});
