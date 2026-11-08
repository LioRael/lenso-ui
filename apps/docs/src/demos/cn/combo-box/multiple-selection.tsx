"use client";

// Native chips preserve keyboard removal and focus.
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
} from "../../en/combo-box/shared";
import { styles } from "../../en/combo-box/styles.stylex";
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
        <ComboBox.Label htmlFor={id}>最喜欢的动物</ComboBox.Label>
        <ComboBox.InputGroup>
          <ComboBox.Input {...menu.input} id={id} placeholder="搜索动物…" />
          <ComboBox.Trigger aria-label="Show animals">
            <ComboBox.Indicator />
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <ComboBox.Chips>
          <ComboBox.Value>
            {(selected: Animal[]) =>
              selected.length === 0 ? (
                <span {...stylex.props(styles.muted)}>未选择任何动物</span>
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
