"use client";

// Native chips preserve keyboard removal and focus.
import { ComboBox } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId, useState } from "react";
import {
  animalLabel,
  AnimalOptions,
  animalValue,
  sameAnimal,
  useFocusMenu,
  type Animal,
} from "../../en/combo-box/shared";
import { styles } from "../../en/combo-box/styles.stylex";
export function MultipleSelection() {
  const id = useId();
  const [selected, setSelected] = useState<Animal[]>([]);
  const menu = useFocusMenu();
  return (
    <div {...stylex.props(styles.field)}>
      <ComboBox
        {...menu.root}
        multiple
        value={selected}
        onValueChange={setSelected}
        itemToLabel={animalLabel}
        itemToValue={animalValue}
        isItemEqualToValue={sameAnimal}
      >
        <ComboBox.Label htmlFor={id}>最喜欢的动物</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input {...menu.input} id={id} placeholder="搜索动物…" />
          <ComboBox.Trigger aria-label="Show animals">
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Chips>
          {selected.length === 0 ? (
            <span>No animals selected</span>
          ) : (
            selected.map((animal) => (
              <ComboBox.Chip key={animal.id} value={animal}>
                {animal.name}
                <ComboBox.ChipRemove aria-label={`Remove ${animal.name}`}>×</ComboBox.ChipRemove>
              </ComboBox.Chip>
            ))
          )}
        </ComboBox.Chips>
        <AnimalOptions />
      </ComboBox>
    </div>
  );
}
