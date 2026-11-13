"use client";
import { Autocomplete } from "@lenso/ui";
export function WithDisabledOptions() {
  return (
    <Autocomplete>
      <Autocomplete.Label>Destination</Autocomplete.Label>
      <Autocomplete.Input />
      <Autocomplete.Content>
        <Autocomplete.List>
          <Autocomplete.Item value="California">California</Autocomplete.Item>
          <Autocomplete.Item disabled value="Texas">
            Texas (unavailable)
          </Autocomplete.Item>
          <Autocomplete.Item value="New York">New York</Autocomplete.Item>
        </Autocomplete.List>
      </Autocomplete.Content>
    </Autocomplete>
  );
}
