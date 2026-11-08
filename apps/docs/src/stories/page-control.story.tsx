import { defineStory } from "./story";
import { PageControlStory } from "./page-control";
export const story = defineStory({
  displayName: "PageControl",
  Component: PageControlStory,
  args: [
    { variant: "Prominent", initial: { count: 6, disabled: false, variant: "prominent" } },
    { variant: "Plain", initial: { count: 6, disabled: false, variant: "plain" } },
  ],
});
