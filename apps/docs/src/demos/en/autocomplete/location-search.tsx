"use client";
/** HeroUI v3.2.6 adaptation. SPDX-License-Identifier: Apache-2.0 */
import { Autocomplete } from "@lenso/ui";
import { useEffect, useState } from "react";
import { NativeAutocomplete } from "./_native";

const cities = [
  { country: "USA", name: "New York" },
  { country: "USA", name: "Los Angeles" },
  { country: "USA", name: "Chicago" },
  { country: "UK", name: "London" },
  { country: "France", name: "Paris" },
  { country: "Japan", name: "Tokyo" },
  { country: "Australia", name: "Sydney" },
  { country: "Canada", name: "Toronto" },
  { country: "Germany", name: "Berlin" },
  { country: "Spain", name: "Madrid" },
].map((city) => ({ ...city, id: city.name }));

export function LocationSearch() {
  const { contains } = Autocomplete.useFilter({ sensitivity: "base" });
  const [query, setQuery] = useState("");
  const [settledQuery, setSettledQuery] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setSettledQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);
  const loading = query !== settledQuery;
  const results = cities.filter((city) => contains(city.name, settledQuery));
  return (
    <NativeAutocomplete
      items={cities}
      label="City"
      placeholder="Search for a city"
      searchLabel="Search cities"
      searchPlaceholder="Search cities..."
      inputValue={query}
      onInputValueChange={setQuery}
      filteredItems={loading ? [] : results}
      loading={loading}
      emptyText="No cities found"
    />
  );
}
