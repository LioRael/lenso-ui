"use client";

import { useTheme } from "next-themes";

import { useIsClient } from "./use-is-client";

type DocsTheme = "dark" | "light";

export function useDocsPageTheme(): DocsTheme {
  const isClient = useIsClient();
  const { resolvedTheme } = useTheme();
  const queryTheme = isClient ? new URLSearchParams(window.location.search).get("theme") : null;

  if (queryTheme === "dark" || queryTheme === "light") return queryTheme;
  return isClient && resolvedTheme === "dark" ? "dark" : "light";
}
