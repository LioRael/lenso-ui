"use client";

import { NativeAutocomplete } from "../../en/autocomplete/_native";
const animals = [
  {
    id: "dog",
    name: "Dog",
  },
  {
    id: "cat",
    name: "Cat",
    disabled: true,
  },
  {
    id: "bird",
    name: "Bird",
  },
  {
    id: "kangaroo",
    name: "Kangaroo",
    disabled: true,
  },
  {
    id: "elephant",
    name: "Elephant",
  },
  {
    id: "tiger",
    name: "Tiger",
  },
];
export function WithDisabledOptions() {
  return (
    <NativeAutocomplete
      items={animals}
      label="动物"
      placeholder="选择一种动物"
      searchLabel="Search animals"
      searchPlaceholder="Search animals..."
    />
  );
}
