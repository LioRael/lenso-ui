import { defineStory } from "./story";
import { RefreshControlStory } from "./refresh-control";
export const story = defineStory({
  displayName: "RefreshControl",
  Component: RefreshControlStory,
  args: [{ variant: "Default", initial: { disabled: false } }],
});
