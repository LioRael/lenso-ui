import { defineStory } from "./story";
import { Basic as Preview, initialArgs } from "@/demos/stories/input-otp";
export const story = defineStory({
  displayName: "InputOTP",
  Component: Preview,
  args: [
    { variant: "Ordinary", initial: initialArgs },
    { variant: "Glass", initial: { ...initialArgs, glass: true } },
  ],
});
