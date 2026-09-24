import { useSyncExternalStore } from "react";

type DocsTheme = "dark" | "light";

function readTheme(): DocsTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function useDocsPageTheme(): DocsTheme {
  return useSyncExternalStore(
    (notify) => {
      const observer = new MutationObserver(notify);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      return () => observer.disconnect();
    },
    readTheme,
    () => "light",
  );
}
