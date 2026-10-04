// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/**
 * HeroUI v3.2.6, Apache-2.0.
 * Modified: abortable fetch and an intersection sentinel replace React Stately's async collection.
 */
import { ComboBox, Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useId, useRef, useState } from "react";
import { styles } from "../../en/combo-box/styles.stylex";
import { useFocusMenu } from "../../en/combo-box/shared";
interface Character {
  name: string;
}
interface Page {
  next: string | null;
  results: Character[];
}
export function AsynchronousLoading() {
  const id = useId();
  const menu = useFocusMenu();
  const [inputValue, setInputValue] = useState("");
  const [items, setItems] = useState<Character[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    const controller = new AbortController();
    const current = ++generation.current;
    // oxlint-disable-next-line react/set-state-in-effect -- Query changes start an abortable external request and reset its visible lifecycle.
    setItems([]);
    setCursor(null);
    setNextPage(null);
    setLoading(true);
    setError(null);
    fetch(`https://swapi.py4e.com/api/people/?search=${encodeURIComponent(inputValue)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return (await response.json()) as Page;
      })
      .then((page) => {
        if (current !== generation.current) return;
        setItems(page.results);
        setCursor(page.next);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : "Unable to load characters");
      })
      .finally(() => {
        if (current === generation.current && !controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [inputValue]);
  useEffect(() => {
    if (!nextPage) return;
    const controller = new AbortController();
    const current = generation.current;
    // oxlint-disable-next-line react/set-state-in-effect -- Pagination starts an external request; cleanup retains cancellation and generation guards.
    setLoading(true);
    setError(null);
    fetch(nextPage.replace(/^http:\/\//i, "https://"), {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        return (await response.json()) as Page;
      })
      .then((page) => {
        if (current !== generation.current) return;
        setItems((previous) => [...previous, ...page.results]);
        setCursor(page.next);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : "Unable to load characters");
      })
      .finally(() => {
        if (current === generation.current && !controller.signal.aborted) {
          setLoading(false);
          setNextPage(null);
        }
      });
    return () => controller.abort();
  }, [nextPage]);
  useEffect(() => {
    if (!sentinel || !cursor || loading || error) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setNextPage(cursor);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, cursor, loading, error]);
  return (
    <div {...stylex.props(styles.field)}>
      <ComboBox<Character>
        {...menu.root}
        items={items}
        filter={null}
        inputValue={inputValue}
        onInputValueChange={setInputValue}
        itemToStringLabel={(character) => character.name}
        itemToStringValue={(character) => character.name}
      >
        <ComboBox.Label htmlFor={id}>选择角色</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input {...menu.input} id={id} placeholder="星球大战角色…" />
          <ComboBox.Trigger aria-label="Show characters">
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Portal>
          <ComboBox.Positioner>
            <ComboBox.Popover>
              <ComboBox.List aria-busy={loading}>
                {(character: Character) => (
                  <ComboBox.Item key={character.name} value={character}>
                    {character.name}
                    <ComboBox.ItemIndicator />
                  </ComboBox.Item>
                )}
              </ComboBox.List>
              <ComboBox.Empty>
                {loading ? "Loading..." : (error ?? "No results found")}
              </ComboBox.Empty>
              <div ref={setSentinel} {...stylex.props(styles.loading)}>
                {loading && (
                  <>
                    <Spinner size="sm" />
                    <span {...stylex.props(styles.muted)}>
                      {items.length ? "加载更多…" : "Loading..."}
                    </span>
                  </>
                )}
                {cursor && !loading && (
                  <button type="button" onClick={() => setNextPage(cursor)}>
                    Load more
                  </button>
                )}
                {error && items.length > 0 && <span role="alert">{error}</span>}
              </div>
            </ComboBox.Popover>
          </ComboBox.Positioner>
        </ComboBox.Portal>
      </ComboBox>
    </div>
  );
}
