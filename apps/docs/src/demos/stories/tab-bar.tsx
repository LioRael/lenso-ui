"use client";

import { TabBarExample, type TabBarExampleProps } from "../en/tab-bar/basic";
import { useStoryLocale } from "@/stories/story-panel";
import { useDataEngine } from "@fumari/stf";

export type TabBarStoryProps = Pick<
  TabBarExampleProps,
  "layout" | "showSearch" | "elastic" | "lift" | "minimized" | "autoMinimize"
>;
export const initialArgs: TabBarStoryProps = /* story-args:start */ {
  layout: "phone",
  showSearch: true,
  elastic: true,
  lift: 20,
  autoMinimize: false,
  minimized: false,
}; /* story-args:end */

export function TabBarStory(props: TabBarStoryProps) {
  const locale = useStoryLocale();
  const engine = useDataEngine();
  return (
    <TabBarExample
      {...initialArgs}
      {...props}
      locale={locale}
      onMinimizedChange={(value) => engine.update(["minimized"], value)}
    />
  );
}
