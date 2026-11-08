import { defineStory } from "./story";
import { TabBarStory, initialArgs } from "@/demos/stories/tab-bar";

export const story = defineStory({
  displayName: "TabBar",
  Component: TabBarStory,
  args: [
    { variant: "Phone", initial: initialArgs },
    { variant: "Tablet", initial: { ...initialArgs, layout: "tablet" } },
    { variant: "Minimized", initial: { ...initialArgs, minimized: true } },
    { variant: "Scroll up", initial: { ...initialArgs, autoMinimize: "up" } },
    { variant: "Scroll", initial: { ...initialArgs, autoMinimize: true } },
  ],
});
