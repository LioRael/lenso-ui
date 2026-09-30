/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 *
 * Adapted from HeroUI v3.2.6 use-list-data.ts, derived from
 * https://github.com/adobe/react-spectrum/blob/main/packages/%40react-stately/data/src/useListData.ts
 * Public key/selection types are local; no React Aria runtime is used.
 */
"use client";
import { useMemo, useState } from "react";

export type Key = string | number;
export type Selection = "all" | Set<Key>;
export interface ListOptions<T> {
  initialItems?: T[];
  initialSelectedKeys?: "all" | Iterable<Key>;
  initialFilterText?: string;
  getKey?: (item: T) => Key;
  filter?: (item: T, filterText: string) => boolean;
}
export interface ListData<T> {
  items: T[];
  selectedKeys: Selection;
  filterText: string;
  setSelectedKeys(keys: Selection): void;
  addKeysToSelection(keys: Selection): void;
  removeKeysFromSelection(keys: Selection): void;
  setFilterText(text: string): void;
  getItem(key: Key): T | undefined;
  insert(index: number, ...values: T[]): void;
  insertBefore(key: Key, ...values: T[]): void;
  insertAfter(key: Key, ...values: T[]): void;
  append(...values: T[]): void;
  prepend(...values: T[]): void;
  remove(...keys: Key[]): void;
  removeSelectedItems(): void;
  move(key: Key, toIndex: number): void;
  moveBefore(key: Key, keys: Iterable<Key>): void;
  moveAfter(key: Key, keys: Iterable<Key>): void;
  update(key: Key, value: T | ((previous: T) => T)): void;
}
export interface ListState<T> {
  items: T[];
  selectedKeys: Selection;
  filterText: string;
}
export interface CreateListOptions<T, C> extends ListOptions<T> {
  cursor?: C;
}
export type ListActions<T> = Omit<ListData<T>, "items" | "selectedKeys" | "getItem" | "filterText">;

function defaultKey<T>(item: T): Key {
  const value = item as { id?: Key; key?: Key };
  const key = value.id ?? value.key;
  if (key === undefined) throw new Error("List items require an id, key, or getKey option.");
  return key;
}

export function useListData<T>(options: ListOptions<T>): ListData<T> {
  const {
    filter,
    getKey = defaultKey<T>,
    initialItems = [],
    initialSelectedKeys,
    initialFilterText = "",
  } = options;
  const [state, setState] = useState<ListState<T>>({
    items: initialItems,
    selectedKeys: initialSelectedKeys === "all" ? "all" : new Set(initialSelectedKeys),
    filterText: initialFilterText,
  });
  const items = useMemo(
    () => (filter ? state.items.filter((item) => filter(item, state.filterText)) : state.items),
    [state.items, state.filterText, filter],
  );
  return {
    ...state,
    items,
    ...createListActions({ getKey }, setState),
    getItem: (key) => state.items.find((item) => getKey(item) === key),
  };
}

export function createListActions<T, C>(
  options: CreateListOptions<T, C>,
  dispatch: (updater: (state: ListState<T>) => ListState<T>) => void,
): ListActions<T> {
  const { cursor, getKey = defaultKey<T> } = options;
  const insert = (state: ListState<T>, index: number, values: T[]): ListState<T> => ({
    ...state,
    items: [...state.items.slice(0, index), ...values, ...state.items.slice(index)],
  });
  const insertRelative = (key: Key, values: T[], after: boolean) =>
    dispatch((state) => {
      const index = state.items.findIndex((item) => getKey(item) === key);
      if (index < 0 && state.items.length) return state;
      return insert(state, Math.max(0, index) + Number(after), values);
    });
  const moveRelative = (target: Key, keys: Iterable<Key>, after: boolean) => {
    const moving = new Set(keys);
    dispatch((state) => {
      if (!state.items.some((item) => getKey(item) === target)) return state;
      const selected = state.items.filter((item) => moving.has(getKey(item)));
      // Count the destination in the original list, then discount moved items before it.
      const originalIndex =
        state.items.findIndex((item) => getKey(item) === target) + Number(after);
      const index =
        originalIndex -
        state.items.slice(0, originalIndex).filter((item) => moving.has(getKey(item))).length;
      const remaining = state.items.filter((item) => !moving.has(getKey(item)));
      return {
        ...state,
        items: [...remaining.slice(0, index), ...selected, ...remaining.slice(index)],
      };
    });
  };
  return {
    setSelectedKeys: (selectedKeys) => dispatch((state) => ({ ...state, selectedKeys })),
    addKeysToSelection: (keys) =>
      dispatch((state) => ({
        ...state,
        selectedKeys:
          state.selectedKeys === "all" || keys === "all"
            ? "all"
            : new Set([...state.selectedKeys, ...keys]),
      })),
    removeKeysFromSelection: (keys) =>
      dispatch((state) => {
        const selectedKeys =
          keys === "all"
            ? new Set<Key>()
            : new Set(state.selectedKeys === "all" ? state.items.map(getKey) : state.selectedKeys);
        if (keys !== "all") for (const key of keys) selectedKeys.delete(key);
        return { ...state, selectedKeys };
      }),
    setFilterText: (filterText) => dispatch((state) => ({ ...state, filterText })),
    insert: (index, ...values) => dispatch((state) => insert(state, index, values)),
    insertBefore: (key, ...values) => insertRelative(key, values, false),
    insertAfter: (key, ...values) => insertRelative(key, values, true),
    append: (...values) => dispatch((state) => insert(state, state.items.length, values)),
    prepend: (...values) => dispatch((state) => insert(state, 0, values)),
    remove: (...keys) =>
      dispatch((state) => {
        const removed = new Set(keys);
        const items = state.items.filter((item) => !removed.has(getKey(item)));
        let selectedKeys: Selection =
          state.selectedKeys === "all"
            ? "all"
            : new Set([...state.selectedKeys].filter((key) => !removed.has(key)));
        if (cursor == null && !items.length) selectedKeys = new Set();
        return { ...state, items, selectedKeys };
      }),
    removeSelectedItems: () =>
      dispatch((state) => {
        const selection = state.selectedKeys;
        return {
          ...state,
          items:
            selection === "all" ? [] : state.items.filter((item) => !selection.has(getKey(item))),
          selectedKeys: new Set(),
        };
      }),
    move: (key, index) =>
      dispatch((state) => {
        const from = state.items.findIndex((item) => getKey(item) === key);
        if (from < 0) return state;
        const items = [...state.items];
        const [item] = items.splice(from, 1);
        if (item !== undefined) items.splice(index, 0, item);
        return { ...state, items };
      }),
    moveBefore: (key, keys) => moveRelative(key, keys, false),
    moveAfter: (key, keys) => moveRelative(key, keys, true),
    update: (key, value) =>
      dispatch((state) => {
        const index = state.items.findIndex((item) => getKey(item) === key);
        const previous = state.items[index];
        if (index < 0 || previous === undefined) return state;
        const next = typeof value === "function" ? (value as (item: T) => T)(previous) : value;
        return {
          ...state,
          items: [...state.items.slice(0, index), next, ...state.items.slice(index + 1)],
        };
      }),
  };
}
