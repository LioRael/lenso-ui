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
 * Adapted from React Stately's useListData through the source recorded in THIRD_PARTY_NOTICES.md:
 * https://github.com/adobe/react-spectrum/blob/main/packages/%40react-stately/data/src/useListData.ts
 * Public key/selection types are local; no React Aria runtime is used.
 */
"use client";
import { useState, useMemo } from "react";
import {
  defaultKey,
  createListActions,
  type ListOptions,
  type ListData,
  type ListState,
} from "@lenso/primitives/hooks";
export {
  createListActions,
  type Key,
  type Selection,
  type ListOptions,
  type ListData,
  type ListState,
  type ListActions,
  type CreateListOptions,
} from "@lenso/primitives/hooks";
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
