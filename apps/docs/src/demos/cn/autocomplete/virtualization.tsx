// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { Autocomplete } from "@lenso/ui";
import { useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { NativeAutocomplete, OptionContent, type Option } from "../../en/autocomplete/_native";
const firstNames = [
  "Emma",
  "Liam",
  "Olivia",
  "Noah",
  "Ava",
  "James",
  "Sophia",
  "Oliver",
  "Isabella",
  "Lucas",
  "Mia",
  "Ethan",
  "Charlotte",
  "Mason",
  "Amelia",
  "Logan",
  "Harper",
  "Alexander",
  "Ella",
  "Benjamin",
];
const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Anderson",
  "Taylor",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Clark",
  "Lewis",
  "Robinson",
  "Walker",
];
const allUsers: Option[] = Array.from(
  {
    length: 1000,
  },
  (_, index) => {
    const first = firstNames[index % firstNames.length] ?? "";
    const last = lastNames[Math.floor(index / firstNames.length) % lastNames.length] ?? "";
    return {
      id: String(index + 1),
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@acme.com`,
    };
  },
);
const virtualStyles = stylex.create({
  field: {
    width: 300,
  },
  list: {
    height: 300,
    overflowY: "auto",
    position: "relative",
    padding: 0,
  },
  row: {
    height: 50,
    boxSizing: "border-box",
  },
  spacer: (height: number) => ({
    height,
  }),
});
export function Virtualization() {
  const { contains } = Autocomplete.useFilter({
    sensitivity: "base",
  });
  const [query, setQuery] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const filtered = allUsers.filter(
    (user) => contains(user.name, query) || contains(user.email ?? "", query),
  );
  const start = Math.max(0, Math.floor(scrollTop / 50) - 3);
  const end = Math.min(filtered.length, start + 14);
  const onHighlight = (item: Option | undefined) => {
    const index = filtered.findIndex((user) => user.id === item?.id);
    const element = listRef.current;
    if (index < 0 || !element) return;
    const top = index * 50;
    if (top < element.scrollTop) element.scrollTop = top;
    else if (top + 50 > element.scrollTop + 300) element.scrollTop = top - 250;
    setScrollTop(element.scrollTop);
  };
  return (
    <NativeAutocomplete
      items={allUsers}
      xstyle={virtualStyles.field}
      filteredItems={filtered}
      virtualized
      onItemHighlighted={onHighlight}
      label="用户"
      placeholder="选择用户"
      searchLabel="Search users"
      searchPlaceholder="Search users..."
      inputValue={query}
      onInputValueChange={(next) => {
        setQuery(next);
        setScrollTop(0);
        if (listRef.current) listRef.current.scrollTop = 0;
      }}
      list={
        <Autocomplete.List
          ref={listRef}
          xstyle={virtualStyles.list}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <div aria-hidden="true" {...stylex.props(virtualStyles.spacer(start * 50))} />
          {filtered.slice(start, end).map((item, offset) => (
            <Autocomplete.Item
              key={item.id}
              value={item}
              index={start + offset}
              aria-setsize={filtered.length}
              aria-posinset={start + offset + 1}
              xstyle={virtualStyles.row}
            >
              <OptionContent item={item} />
              <Autocomplete.ItemIndicator />
            </Autocomplete.Item>
          ))}
          <div
            aria-hidden="true"
            {...stylex.props(virtualStyles.spacer((filtered.length - end) * 50))}
          />
        </Autocomplete.List>
      }
    />
  );
}
