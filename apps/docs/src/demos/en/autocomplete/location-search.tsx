"use client";
import { useEffect, useState } from "react";
import { TextSuggestions } from "./text-suggestions";
const cities = ["New York", "London", "Paris", "Tokyo", "Sydney"];
export function LocationSearch() {
  const [value, setValue] = useState("");
  const [settled, setSettled] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setSettled(value), 300);
    return () => clearTimeout(timeout);
  }, [value]);
  return (
    <TextSuggestions
      label="City"
      value={value}
      onValueChange={setValue}
      filter={false}
      options={cities.filter((city) =>
        city.toLocaleLowerCase().includes(settled.toLocaleLowerCase()),
      )}
    />
  );
}
