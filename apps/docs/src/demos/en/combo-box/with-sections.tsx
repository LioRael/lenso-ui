"use client";
// Native grouped collection filters without losing section semantics.
import { ComboBox } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { styles } from "./styles.stylex";
import { useFocusMenu } from "./shared";
const regions = [
  {
    label: "North America",
    items: [
      { value: "usa", label: "United States" },
      { value: "canada", label: "Canada" },
      { value: "mexico", label: "Mexico" },
    ],
  },
  {
    label: "Europe",
    items: [
      { value: "uk", label: "United Kingdom" },
      { value: "france", label: "France" },
      { value: "germany", label: "Germany" },
      { value: "spain", label: "Spain" },
      { value: "italy", label: "Italy" },
    ],
  },
  {
    label: "Asia",
    items: [
      { value: "japan", label: "Japan" },
      { value: "china", label: "China" },
      { value: "india", label: "India" },
      { value: "south-korea", label: "South Korea" },
    ],
  },
];
export function WithSections() {
  const id = useId();
  const menu = useFocusMenu();
  return (
    <div {...stylex.props(styles.field)}>
      <ComboBox {...menu.root}>
        <ComboBox.Label htmlFor={id}>Country</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input {...menu.input} id={id} placeholder="Search countries..." />
          <ComboBox.Trigger aria-label="Show countries">
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Content>
          <ComboBox.List>
            {regions.map((region: (typeof regions)[number], index: number) => (
              <ComboBox.Group key={region.label}>
                {index > 0 && <ComboBox.Separator />}
                <ComboBox.GroupLabel>{region.label}</ComboBox.GroupLabel>
                {region.items.map((country) => (
                  <ComboBox.Item key={country.value} value={country.value} label={country.label}>
                    {country.label}
                    <ComboBox.ItemIndicator />
                  </ComboBox.Item>
                ))}
              </ComboBox.Group>
            ))}
          </ComboBox.List>
        </ComboBox.Content>
      </ComboBox>
    </div>
  );
}
