"use client";
import { ComboBox } from "@lenso/ui";
import { useId, useState } from "react";
import { OptionPicker } from "./_native";

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
  const { contains } = {
    contains: (text: string, query: string) =>
      text.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  };
  const [query, setQuery] = useState("");
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => contains(item.name, query)),
    }))
    .filter((group) => group.items.length);
  return (
    <OptionPicker
      items={groups.flatMap((group) => group.items)}
      filteredItems={visibleGroups.flatMap((group) => group.items)}
      label="Country"
      placeholder="Select a country"
      searchLabel="Search countries"
      searchPlaceholder="Search countries..."
      query={query}
      onQueryChange={setQuery}
      list={
        <ComboBox.List>
          {visibleGroups.map((group, index) => (
            <ComboBox.Group key={group.name} aria-labelledby={`${id}-${index}`}>
              {index > 0 && <ComboBox.Separator />}
              <ComboBox.GroupLabel id={`${id}-${index}`}>{group.name}</ComboBox.GroupLabel>
              {group.items.map((item) => (
                <ComboBox.Item key={item.id} value={item} label={item.name}>
                  {item.name}
                  <ComboBox.ItemIndicator />
                </ComboBox.Item>
              ))}
            </ComboBox.Group>
          ))}
        </ComboBox.List>
      }
    />
  );
}
