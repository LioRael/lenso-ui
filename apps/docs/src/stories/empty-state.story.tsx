import { defineStory } from "./story";
import { EmptyStateStory } from "./empty-state";
export const story = defineStory({
  displayName: "EmptyState",
  Component: EmptyStateStory,
  args: [
    {
      variant: "Default",
      initial: {
        variant: "symbol",
        title: "No collections",
        description: "Create one to organize your items.",
        withAction: true,
      },
    },
  ],
});
