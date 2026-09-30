"use client";
// HeroUI v3.2.6, Apache-2.0.
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker, smallAnimals, type Animal } from "./shared";
import { styles } from "./styles.stylex";
export function Controlled() {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(smallAnimals[0] ?? null);
  return (
    <div {...stylex.props(styles.column)}>
      <AnimalPicker
        label="Animal (controlled)"
        items={smallAnimals}
        value={selectedAnimal}
        onValueChange={setSelectedAnimal}
      />
      <p {...stylex.props(styles.muted)}>Selected: {selectedAnimal?.name || "None"}</p>
    </div>
  );
}
