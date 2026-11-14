"use client";
import { createContext, useContext, type ReactNode, type ComponentType } from "react";
const Language = createContext<"en" | "cn">("en");
export const useStoryLocale = () => useContext(Language);
export const KeyboardGuidance = createContext<ReactNode>(null);
export type StoryFile = { file: string; code: string };
export type PlaygroundScenario = {
  id: string;
  title: string;
  initial?: boolean;
  Preview: ComponentType;
  loadFiles: () => Promise<{ name: string; code: string }[]>;
};
export const Scenarios = createContext<PlaygroundScenario[]>([]);
export const Sources = createContext<{
  files?: StoryFile[];
  loadFiles?: () => Promise<StoryFile[]>;
}>({});
export function StoryLanguage({
  locale,
  files,
  loadFiles,
  children,
  scenarios = [],
}: {
  locale: "en" | "cn";
  files?: StoryFile[];
  loadFiles?: () => Promise<StoryFile[]>;
  children: ReactNode;
  scenarios?: PlaygroundScenario[];
}) {
  return (
    <Language value={locale}>
      <Sources value={{ files, loadFiles }}>
        <Scenarios value={scenarios}>{children}</Scenarios>
      </Sources>
    </Language>
  );
}
