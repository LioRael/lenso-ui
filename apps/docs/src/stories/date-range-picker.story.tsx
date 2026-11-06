import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/date-range-picker";
export const story = defineStory({
  displayName: "DateRangePicker",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
