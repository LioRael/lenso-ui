"use client";
// HeroUI v3.2.6, Apache-2.0.
import { AnimalPicker } from "./shared";
const animals = [
  { id: "dog", name: "Dog" },
  { id: "cat", name: "Cat" },
  { id: "bird", name: "Bird" },
  { id: "kangaroo", name: "Kangaroo" },
  { id: "elephant", name: "Elephant" },
  { id: "tiger", name: "Tiger" },
];
export function WithDisabledOptions() {
  return <AnimalPicker label="Animal" items={animals} disabledIds={["cat", "kangaroo"]} />;
}
