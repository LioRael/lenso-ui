"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { useIsClient } from "./use-is-client";

export function ThemeToggle() {
  const isClient = useIsClient();
  const { resolvedTheme, setTheme, theme } = useTheme();

  const dark = isClient && resolvedTheme === "dark";
  const nextTheme = dark ? "light" : "dark";
  const currentTheme = isClient ? theme : "system";

  return (
    <button
      aria-label={`Use ${nextTheme} theme`}
      className="docs-theme-toggle"
      data-current-theme={currentTheme}
      onClick={() => setTheme(nextTheme)}
      title={`Theme: ${currentTheme}. Use ${nextTheme}.`}
      type="button"
    >
      {dark ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
    </button>
  );
}
