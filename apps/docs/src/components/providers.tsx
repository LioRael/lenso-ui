"use client";

import { ThemeProvider } from "next-themes";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { useSyncExternalStore, type ReactNode } from "react";
export { ThemeToggle as ThemeSelector } from "./fumadocs/ui/theme-toggle";

function subscribeDirection(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
  return () => observer.disconnect();
}

function getDirection() {
  return document.documentElement.dir === "rtl" ? ("rtl" as const) : ("ltr" as const);
}

export function Providers({ children }: { children: ReactNode }) {
  const direction = useSyncExternalStore(subscribeDirection, getDirection, () => "ltr" as const);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <DirectionProvider direction={direction}>{children}</DirectionProvider>
    </ThemeProvider>
  );
}
