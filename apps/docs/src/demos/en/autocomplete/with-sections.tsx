"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { Autocomplete } from "@lenso/ui";
import { useId, useState } from "react";
import { NativeAutocomplete } from "./_native";

const groups = [
  {
    name: "North America",
    items: [
      { id: "usa", name: "United States" },
      { id: "canada", name: "Canada" },
      { id: "mexico", name: "Mexico" },
    ],
  },
  {
    name: "Europe",
    items: [
      { id: "uk", name: "United Kingdom" },
      { id: "france", name: "France" },
      { id: "germany", name: "Germany" },
      { id: "spain", name: "Spain" },
      { id: "italy", name: "Italy" },
    ],
  },
  {
    name: "Asia",
    items: [
      { id: "japan", name: "Japan" },
      { id: "china", name: "China" },
      { id: "india", name: "India" },
      { id: "south-korea", name: "South Korea" },
    ],
  },
];
export function WithSections() {
  const id = useId();
  const { contains } = Autocomplete.useFilter({ sensitivity: "base" });
  const [query, setQuery] = useState("");
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => contains(item.name, query)),
    }))
    .filter((group) => group.items.length);
  return (
    <NativeAutocomplete
      items={groups.flatMap((group) => group.items)}
      filteredItems={visibleGroups.flatMap((group) => group.items)}
      label="Country"
      placeholder="Select a country"
      searchLabel="Search countries"
      searchPlaceholder="Search countries..."
      inputValue={query}
      onInputValueChange={setQuery}
      list={
        <Autocomplete.List>
          {visibleGroups.map((group, index) => (
            <Autocomplete.Group key={group.name} aria-labelledby={`${id}-${index}`}>
              {index > 0 && <Autocomplete.Separator />}
              <Autocomplete.GroupLabel id={`${id}-${index}`}>{group.name}</Autocomplete.GroupLabel>
              {group.items.map((item) => (
                <Autocomplete.Item key={item.id} value={item}>
                  {item.name}
                  <Autocomplete.ItemIndicator />
                </Autocomplete.Item>
              ))}
            </Autocomplete.Group>
          ))}
        </Autocomplete.List>
      }
    />
  );
}
