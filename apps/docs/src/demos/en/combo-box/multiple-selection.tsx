"use client";
// HeroUI v3.2.6, Apache-2.0. Native chips preserve keyboard removal and focus.
import { ComboBox } from "@lenso/ui";
import { useId } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  animals,
  animalLabel,
  animalValue,
  sameAnimal,
  AnimalOptions,
  type Animal,
  useFocusMenu,
} from "./shared";
import { styles } from "./styles.stylex";

export function MultipleSelection() {
  const id = useId();
  const menu = useFocusMenu();
  return (
    <div {...stylex.props(styles.field)}>
      <ComboBox
        {...menu.root}
        multiple
        items={animals}
        itemToStringLabel={animalLabel}
        itemToStringValue={animalValue}
        isItemEqualToValue={sameAnimal}
      >
        <ComboBox.Label htmlFor={id}>Favorite Animals</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input {...menu.input} id={id} placeholder="Search animals..." />
          <ComboBox.Trigger aria-label="Show animals">
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Chips>
          <ComboBox.Value>
            {(selected: Animal[]) =>
              selected.length === 0 ? (
                <span {...stylex.props(styles.muted)}>No animals selected</span>
              ) : (
                selected.map((animal) => (
                  <ComboBox.Chip key={animal.id}>
                    {animal.name}
                    <ComboBox.ChipRemove aria-label={`Remove ${animal.name}`}>
                      ×
                    </ComboBox.ChipRemove>
                  </ComboBox.Chip>
                ))
              )
            }
          </ComboBox.Value>
        </ComboBox.Chips>
        <AnimalOptions />
      </ComboBox>
    </div>
  );
}
