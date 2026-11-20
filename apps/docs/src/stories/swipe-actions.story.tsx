import { defineStory } from "./story";
import { SwipeActionsStory } from "./swipe-actions";
export const story = defineStory({
  displayName: "SwipeActions",
  Component: SwipeActionsStory,
  args: [
    {
      variant: "Symbol and label",
      initial: { disabled: false, fullSwipe: false, labelPlacement: "inline" },
    },
    {
      variant: "Symbol only",
      initial: { disabled: false, fullSwipe: false, labelPlacement: "hidden" },
    },
    {
      variant: "Label below",
      initial: { disabled: false, fullSwipe: false, labelPlacement: "below" },
    },
    {
      variant: "Full swipe to archive",
      initial: { disabled: false, fullSwipe: true, labelPlacement: "inline" },
    },
  ],
});
