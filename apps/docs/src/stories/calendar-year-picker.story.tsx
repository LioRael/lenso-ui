import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/calendar-year-picker";
export const story = defineStory({
  displayName: "CalendarYearPicker",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
