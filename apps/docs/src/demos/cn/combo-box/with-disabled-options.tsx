"use client";

import { AnimalPicker } from "../../en/combo-box/shared";
const animals = [
  {
    id: "dog",
    name: "Dog",
  },
  {
    id: "cat",
    name: "Cat",
  },
  {
    id: "bird",
    name: "Bird",
  },
  {
    id: "kangaroo",
    name: "Kangaroo",
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
  return <AnimalPicker label="动物" items={animals} disabledIds={["cat", "kangaroo"]} />;
}
