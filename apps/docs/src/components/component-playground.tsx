import type { ComponentType } from "react";
import type { StoryFile, PlaygroundScenario } from "@/stories/story-context";
export function ComponentPlayground({
  locale,
  Preview,
  loadFiles,
  scenarios,
}: {
  family: string;
  locale: "en" | "cn";
  Preview: ComponentType<{
    locale: "en" | "cn";
    loadFiles?: () => Promise<StoryFile[]>;
    scenarios?: PlaygroundScenario[];
  }>;
  loadFiles?: () => Promise<StoryFile[]>;
  scenarios?: PlaygroundScenario[];
}) {
  return <Preview locale={locale} loadFiles={loadFiles} scenarios={scenarios} />;
}
