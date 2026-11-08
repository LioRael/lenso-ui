import { defineStory } from "./story";
import { NavigationBarStory } from "./navigation-bar";
export const story = defineStory({
  displayName: "NavigationBar",
  Component: NavigationBarStory,
  args: [
    { variant: "Large title", initial: { large: true, edge: "uniform" } },
    { variant: "Inline title", initial: { large: false, edge: "uniform" } },
  ],
});
