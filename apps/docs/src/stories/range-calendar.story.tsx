import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/range-calendar";
export const story = defineStory({
  displayName: "RangeCalendar",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
