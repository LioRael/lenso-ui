import type { ComponentType } from "react";
import type { StoryFile } from "@/stories/story-context";
export function ComponentPlayground({
  locale,
  Preview,
  loadFiles,
}: {
  family: string;
  locale: "en" | "cn";
  Preview: ComponentType<{ locale: "en" | "cn"; loadFiles?: () => Promise<StoryFile[]> }>;
  loadFiles?: () => Promise<StoryFile[]>;
}) {
  return <Preview locale={locale} loadFiles={loadFiles} />;
}
