"use client";
/**
 * HeroUI v3.2.6 adaptation. Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: abortable native fetch and scroll pagination replace RAC collection/load-more.
 */
import { Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useRef, useState } from "react";
import { exampleStyles, SelectExample } from "./select-example";
interface PokemonPage {
  next: string | null;
  results: { name: string }[];
}
const INITIAL_URL = "https://pokeapi.co/api/v2/pokemon";
export function AsynchronousLoading() {
  const [pokemon, setPokemon] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [cursor, setCursor] = useState<string | null>(INITIAL_URL);
  const controller = useRef<AbortController | null>(null);
  const load = useCallback(async (url: string | null) => {
    if (!url || controller.current) return;
    const request = new AbortController();
    controller.current = request;
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(url, { signal: request.signal });
      if (!response.ok) throw new Error(`Pokemon request failed (${response.status})`);
      const page: PokemonPage = await response.json();
      if (request.signal.aborted || controller.current !== request) return;
      setCursor(page.next);
      setPokemon((previous) => [...previous, ...page.results]);
    } catch {
      if (!request.signal.aborted && controller.current === request) setError(true);
    } finally {
      if (controller.current === request) {
        controller.current = null;
        setLoading(false);
      }
    }
  }, []);
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- Mount starts an abortable external request; the stable loader does not depend on the pagination cursor.
    void load(INITIAL_URL);
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, [load]);
  return (
    <SelectExample
      label="Pick a Pokemon"
      placeholder="Select a Pokemon"
      choices={pokemon.map(({ name }) => ({ value: name, label: name }))}
      onPopoverScroll={(event) => {
        const element = event.currentTarget;
        if (element.scrollHeight - element.scrollTop - element.clientHeight < 48) void load(cursor);
      }}
      footer={
        <div {...stylex.props(exampleStyles.loading)}>
          {loading && (
            <>
              <Spinner size="sm" />
              <span {...stylex.props(exampleStyles.note)}>Loading more...</span>
            </>
          )}
          {!loading && cursor && (
            <button
              type="button"
              {...stylex.props(exampleStyles.action)}
              onClick={() => void load(cursor)}
            >
              {error ? "Retry loading" : "Load more"}
            </button>
          )}
        </div>
      }
    />
  );
}
