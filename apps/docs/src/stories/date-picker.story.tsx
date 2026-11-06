import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/date-picker";
export const story = defineStory({
  displayName: "DatePicker",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
