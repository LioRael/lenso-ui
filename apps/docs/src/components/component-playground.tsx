import { useEffect, useState, type ComponentType } from "react";
import type { StoryFile } from "@/stories/story-panel";
export function ComponentPlayground({
  locale,
  Preview,
  loadFiles,
}: {
  family: string;
  locale: "en" | "cn";
  Preview: ComponentType<{ locale: "en" | "cn"; files?: StoryFile[] }>;
  loadFiles?: () => Promise<StoryFile[]>;
}) {
  const [files, setFiles] = useState<StoryFile[]>();
  const [error, setError] = useState<unknown>();
  useEffect(() => {
    let current = true;
    loadFiles?.().then(
      (value) => {
        if (current) setFiles(value);
      },
      (reason) => {
        if (current) setError(reason);
      },
    );
    return () => {
      current = false;
    };
  }, [loadFiles]);
  if (error) throw error;
  return <Preview locale={locale} files={files} />;
}
