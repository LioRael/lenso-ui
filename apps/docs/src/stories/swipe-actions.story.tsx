import { defineStory } from "./story";
import { SwipeActionsStory } from "./swipe-actions";
export const story = defineStory({
  displayName: "SwipeActions",
  Component: SwipeActionsStory,
  args: [
    { variant: "Reveal actions", initial: { disabled: false, fullSwipe: false } },
    { variant: "Full swipe to archive", initial: { disabled: false, fullSwipe: true } },
  ],
});
