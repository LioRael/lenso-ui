"use client";
// HeroUI v3.2.6, Apache-2.0. Native grouped collection filters without losing section semantics.
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
      <ComboBox {...menu.root} items={regions}>
        <ComboBox.Label htmlFor={id}>Country</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input {...menu.input} id={id} placeholder="Search countries..." />
          <ComboBox.Trigger aria-label="Show countries">
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Portal>
          <ComboBox.Positioner>
            <ComboBox.Popover>
              <ComboBox.List>
                {(region: (typeof regions)[number], index: number) => (
                  <ComboBox.Group key={region.label} items={region.items}>
                    {index > 0 && <ComboBox.Separator />}
                    <ComboBox.GroupLabel>{region.label}</ComboBox.GroupLabel>
                    <ComboBox.Collection>
                      {(country: (typeof region.items)[number]) => (
                        <ComboBox.Item key={country.value} value={country}>
                          {country.label}
                          <ComboBox.ItemIndicator />
                        </ComboBox.Item>
                      )}
                    </ComboBox.Collection>
                  </ComboBox.Group>
                )}
              </ComboBox.List>
            </ComboBox.Popover>
          </ComboBox.Positioner>
        </ComboBox.Portal>
      </ComboBox>
    </div>
  );
}
