import { defineStory } from "./story";
import { BreadcrumbsBasic as Preview, initialArgs } from "@/demos/stories/breadcrumbs";
export const story = defineStory({
  displayName: "Breadcrumbs",
  Component: Preview,
  args: [{ variant: "Default", initial: initialArgs }],
});
