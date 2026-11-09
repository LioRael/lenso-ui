"use client";
import { useContext, useEffect, useState } from "react";
import { useStory } from "@fumadocs/story";
import { Sources, useStoryLocale, type StoryFile } from "./story-context";
import { ComponentSource } from "@/components/component-source";
import { storyUsage } from "./usage";
import { useLiveArgs } from "./use-live-args";
export default function StorySource({ active }: { active: boolean }) {
  const cn = useStoryLocale() === "cn";
  const { displayName } = useStory();
  const args = useLiveArgs();
  const { files: suppliedFiles, loadFiles } = useContext(Sources);
  const [loaded, setLoaded] = useState<StoryFile[]>();
  const [error, setError] = useState<unknown>();
  useEffect(() => {
    if (!active || suppliedFiles || !loadFiles) return;
    let current = true;
    loadFiles().then(
      (value) => {
        if (current) setLoaded(value);
      },
      (reason) => {
        if (current) setError(reason);
      },
    );
    return () => {
      current = false;
    };
  }, [active, suppliedFiles, loadFiles]);
  if (error) throw error;
  const files = suppliedFiles ?? loaded;
  if (files === undefined && loadFiles)
    return <output>{cn ? "正在加载源码…" : "Loading source…"}</output>;
  const sourceFiles = files?.map((file) => ({
    name: file.file,
    code: file.code.replace(
      /\/\* story-args:start \*\/[\s\S]*?\/\* story-args:end \*\//,
      JSON.stringify(args, null, 2),
    ),
  }));
  const code =
    sourceFiles === undefined ? "" : (sourceFiles[0]?.code ?? storyUsage(displayName ?? "", args));
  return (
    <ComponentSource
      code={code}
      local
      files={sourceFiles}
      standalone
      live
      active={active}
      locale={cn ? "cn" : "en"}
    />
  );
}
