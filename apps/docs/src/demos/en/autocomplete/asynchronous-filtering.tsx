"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { useEffect, useState } from "react";
import { NativeAutocomplete, type Option } from "./_native";

interface ResponseData {
  results: { name: string }[];
}
export function AsynchronousFiltering() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ query: string; items: Option[]; error?: string } | null>(
    null,
  );
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await fetch(
          `https://swapi.py4e.com/api/people/?search=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Could not load characters");
        const data = (await response.json()) as ResponseData;
        if (!controller.signal.aborted)
          setResult({
            query,
            items: data.results.map((item) => ({ id: item.name, name: item.name })),
          });
      } catch (error) {
        if (!controller.signal.aborted)
          setResult({
            query,
            items: [],
            error: error instanceof Error ? error.message : "Could not load characters",
          });
      }
    };
    void load();
    return () => controller.abort();
  }, [query]);
  const loading = result?.query !== query;
  return (
    <NativeAutocomplete
      items={result?.items ?? []}
      filteredItems={loading ? [] : (result?.items ?? [])}
      label="Search a Star Wars characters"
      placeholder="Search..."
      searchLabel="Search characters"
      searchPlaceholder="Search characters..."
      inputValue={query}
      onInputValueChange={setQuery}
      loading={loading}
      emptyText={result?.error || "No results found"}
    />
  );
}
