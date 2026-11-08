import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/textarea";
export const story = defineStory({
  displayName: "TextArea",
  Component: Preview,
  args: [
    { variant: "Default", initial: initialArgs },
    { variant: "Glass", initial: { ...initialArgs, glass: true } },
    { variant: "Glass and elastic", initial: { ...initialArgs, glass: true, elastic: true } },
  ],
});
