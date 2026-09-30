"use client";
/**
 * Derived from HeroUI v3.2.6, commit e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
 * Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0
 * Modified: native Base UI compounds and compiled StyleX layout.
 */
import { ComboBox, type ComboBoxRootProps } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId, useState, type ReactNode } from "react";
import { styles } from "./styles.stylex";

export interface Animal {
  id: string;
  name: string;
}
export const animals: Animal[] = [
  { id: "aardvark", name: "Aardvark" },
  { id: "cat", name: "Cat" },
  { id: "dog", name: "Dog" },
  { id: "kangaroo", name: "Kangaroo" },
  { id: "panda", name: "Panda" },
  { id: "snake", name: "Snake" },
];
export const smallAnimals: Animal[] = [
  { id: "cat", name: "Cat" },
  { id: "dog", name: "Dog" },
  { id: "bird", name: "Bird" },
  { id: "fish", name: "Fish" },
  { id: "hamster", name: "Hamster" },
];
export const animalLabel = (animal: Animal) => animal.name;
export const animalValue = (animal: Animal) => animal.id;
export const sameAnimal = (a: Animal, b: Animal) => a.id === b.id;

export function useFocusMenu() {
  const [open, setOpen] = useState(false);
  return {
    root: { open, onOpenChange: setOpen },
    input: { onFocus: () => setOpen(true) },
  };
}

export function AnimalOptions({ disabledIds = [] }: { disabledIds?: string[] }) {
  return (
    <ComboBox.Portal>
      <ComboBox.Positioner>
        <ComboBox.Popover>
          <ComboBox.List>
            {(animal: Animal) => (
              <ComboBox.Item
                key={animal.id}
                value={animal}
                disabled={disabledIds.includes(animal.id)}
              >
                {animal.name}
                <ComboBox.ItemIndicator />
              </ComboBox.Item>
            )}
          </ComboBox.List>
        </ComboBox.Popover>
      </ComboBox.Positioner>
    </ComboBox.Portal>
  );
}

export function AnimalPicker({
  label = "Favorite Animal",
  placeholder = "Search animals...",
  description,
  indicator,
  disabledIds,
  secondary = false,
  inputFocus,
  composed = false,
  items = animals,
  ...rootProps
}: ComboBoxRootProps<Animal> & {
  label?: string;
  placeholder?: string;
  description?: ReactNode;
  indicator?: ReactNode;
  disabledIds?: string[];
  secondary?: boolean;
  inputFocus?: () => void;
  composed?: boolean;
}) {
  const id = useId();
  const menu = useFocusMenu();
  return (
    <div {...stylex.props(styles.field, rootProps.fullWidth && styles.fullWidth)}>
      <ComboBox
        items={items}
        itemToStringLabel={animalLabel}
        itemToStringValue={animalValue}
        isItemEqualToValue={sameAnimal}
        {...menu.root}
        {...rootProps}
      >
        <ComboBox.Label htmlFor={id}>{label}</ComboBox.Label>
        <ComboBox.InputGroup
          xstyle={secondary && styles.secondary}
          render={composed ? (props) => <div {...props} data-custom="foo" /> : undefined}
        >
          <ComboBox.Input
            id={id}
            placeholder={placeholder}
            aria-describedby={description ? `${id}-description` : undefined}
            onFocus={inputFocus ?? (rootProps.open === undefined ? menu.input.onFocus : undefined)}
          />
          <ComboBox.Trigger aria-label={`Show ${label.toLowerCase()} options`}>
            {indicator ?? <ComboBox.Indicator />}
          </ComboBox.Trigger>
        </ComboBox.InputGroup>
        <AnimalOptions disabledIds={disabledIds} />
        {description && (
          <p id={`${id}-description`} {...stylex.props(styles.muted)}>
            {description}
          </p>
        )}
      </ComboBox>
    </div>
  );
}
