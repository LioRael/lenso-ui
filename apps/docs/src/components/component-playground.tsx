import type { ComponentType, ReactNode } from "react";
import { KeyboardGuidance, type StoryFile, type PlaygroundScenario } from "@/stories/story-context";
export function ComponentPlayground({
  locale,
  Preview,
  loadFiles,
  scenarios,
  children,
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
  children?: ReactNode;
}) {
  return (
    <KeyboardGuidance value={children}>
      <Preview locale={locale} loadFiles={loadFiles} scenarios={scenarios} />
    </KeyboardGuidance>
  );
}
