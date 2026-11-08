import { defineStory } from "./story";
import { ListStory } from "./list";
export const story = defineStory({
  displayName: "List",
  Component: ListStory,
  args: [{ variant: "Default", initial: { tall: true } }],
});
