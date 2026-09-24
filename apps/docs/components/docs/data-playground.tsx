"use client";

import type { ReactNode } from "react";

import { LivePlayground } from "./live-playground";
import { useDocsPageTheme } from "./use-docs-page-theme";

export function DataPlayground({ children }: { children: ReactNode }) {
  const theme = useDocsPageTheme();
  return <LivePlayground layout="data" preview={children} theme={theme} />;
}
