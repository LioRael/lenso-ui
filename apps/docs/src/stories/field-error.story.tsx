import { defineStory } from "./story";
import { Preview, initialArgs } from "@/demos/stories/field-error";
export const story = defineStory({
  displayName: "FieldError",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
