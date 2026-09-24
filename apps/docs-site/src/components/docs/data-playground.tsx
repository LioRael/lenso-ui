"use client";

import type { ReactNode } from "react";

import { LivePlayground } from "./live-playground";
import { useDocsPageTheme } from "./use-docs-page-theme";

export function DataPlayground({
  children,
  controls,
}: {
  children: ReactNode;
  controls?: ReactNode;
}) {
  const theme = useDocsPageTheme();
  return <LivePlayground controls={controls} layout="data" preview={children} theme={theme} />;
}
