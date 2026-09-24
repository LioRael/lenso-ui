"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import * as stylex from "@stylexjs/stylex";
import { useTheme } from "next-themes";
import { IconButton } from "@lenso/ui/icon-button";

import { useIsClient } from "./use-is-client";

const styles = stylex.create({
  mobileTouchTarget: {
    height: "32px",
    width: "32px",
    "::after": { content: '""', inset: "-6px", position: "absolute" },
  },
});

export function ThemeToggle() {
  const isClient = useIsClient();
  const { resolvedTheme, setTheme, theme } = useTheme();

  const dark = isClient && resolvedTheme === "dark";
  const nextTheme = dark ? "light" : "dark";
  const currentTheme = isClient ? theme : "system";

  return (
    <IconButton
      aria-label={`Use ${nextTheme} theme`}
      data-current-theme={currentTheme}
      onClick={() => setTheme(nextTheme)}
      size="default"
      title={`Theme: ${currentTheme}. Use ${nextTheme}.`}
      variant="ghost"
      xstyle={styles.mobileTouchTarget}
    >
      {dark ? <SunIcon aria-hidden="true" /> : <MoonIcon aria-hidden="true" />}
    </IconButton>
  );
}
