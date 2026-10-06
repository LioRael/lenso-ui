"use client";

// Inspired by HeroUI v3.2.6 themes hooks (Apache-2.0).
// Modified: domain-validated queries and bounded editor-only undo/redo.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryStates } from "nuqs";

import { validateBuilderSettings, type BuilderSettings } from "@/lib/theme-builder-model";
import {
  builderQueryParsers,
  builderQueryValues,
  settingsFromQuery,
} from "@/lib/theme-builder-query";

interface History {
  past: BuilderSettings[];
  future: BuilderSettings[];
}

export function useThemeBuilderState() {
  const [query, setQuery] = useQueryStates(builderQueryParsers, {
    history: "push",
    shallow: true,
    clearOnDefault: true,
  });
  const settings = useMemo(() => settingsFromQuery(query), [query]);
  const [history, setHistory] = useState<History>({ past: [], future: [] });

  useEffect(() => {
    // Browser navigation owns its own history. Never reuse editor snapshots from
    // a different browser entry, and never navigate off-page to implement Undo.
    const resetHistory = () => setHistory({ past: [], future: [] });
    window.addEventListener("popstate", resetHistory);
    return () => window.removeEventListener("popstate", resetHistory);
  }, []);

  const replace = useCallback(
    (input: BuilderSettings) => {
      const next = validateBuilderSettings(input);
      if (JSON.stringify(settings) !== JSON.stringify(next)) {
        setHistory((previous) => ({
          past: [...previous.past, settings].slice(-100),
          future: [],
        }));
      }
      // Always write the whole settings set: imports without the optional flag
      // and Reset must remove it rather than retaining a previous URL value.
      void setQuery(builderQueryValues(next));
    },
    [settings, setQuery],
  );

  const undo = useCallback(() => {
    const previous = history.past.at(-1);
    if (!previous) return;
    setHistory({
      past: history.past.slice(0, -1),
      future: [settings, ...history.future],
    });
    void setQuery(builderQueryValues(previous), { history: "replace" });
  }, [history, settings, setQuery]);

  const redo = useCallback(() => {
    const next = history.future[0];
    if (!next) return;
    setHistory({
      past: [...history.past, settings].slice(-100),
      future: history.future.slice(1),
    });
    void setQuery(builderQueryValues(next), { history: "replace" });
  }, [history, settings, setQuery]);

  return {
    settings,
    replace,
    undo,
    redo,
    canUndo: !!history.past.length,
    canRedo: !!history.future.length,
  };
}
