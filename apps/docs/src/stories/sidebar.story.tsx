import { defineStory } from "./story";
import { SidebarStory } from "./sidebar";
export const story = defineStory({
  displayName: "Sidebar",
  Component: SidebarStory,
  args: [{ variant: "Default", initial: { disabled: false } }],
});
