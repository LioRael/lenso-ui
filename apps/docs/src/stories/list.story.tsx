import { defineStory } from "./story";
import { ListStory } from "./list";
export const story = defineStory({
  displayName: "List",
  Component: ListStory,
  args: [
    { variant: "Default", initial: { tall: true } },
    { variant: "Editing and refresh", initial: { tall: true, interactive: true } },
  ],
});
