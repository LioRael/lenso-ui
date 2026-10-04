// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6, Apache-2.0.
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
