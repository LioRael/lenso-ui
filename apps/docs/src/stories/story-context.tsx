"use client";
import { createContext, useContext, type ReactNode } from "react";
const Language = createContext<"en" | "cn">("en");
export const useStoryLocale = () => useContext(Language);
export type StoryFile = { file: string; code: string };
export const Sources = createContext<{
  files?: StoryFile[];
  loadFiles?: () => Promise<StoryFile[]>;
}>({});
export function StoryLanguage({
  locale,
  files,
  loadFiles,
  children,
}: {
  locale: "en" | "cn";
  files?: StoryFile[];
  loadFiles?: () => Promise<StoryFile[]>;
  children: ReactNode;
}) {
  return (
    <Language value={locale}>
      <Sources value={{ files, loadFiles }}>{children}</Sources>
    </Language>
  );
}
