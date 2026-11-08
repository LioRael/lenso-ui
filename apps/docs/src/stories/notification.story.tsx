import { defineStory } from "./story";
import { NotificationStory } from "./notification";
export const story = defineStory({
  displayName: "Notification",
  Component: NotificationStory,
  args: [
    { variant: "Default", initial: { stackCount: 1 } },
    { variant: "With preview", initial: { stackCount: 1, preview: true } },
    { variant: "Two notifications", initial: { stackCount: 2 } },
    { variant: "Three notifications", initial: { stackCount: 3 } },
  ],
});
