"use client";

import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { AnimalPicker, smallAnimals, type Animal } from "../../en/combo-box/shared";
import { styles } from "../../en/combo-box/styles.stylex";
export function Controlled() {
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(smallAnimals[0] ?? null);
  return (
    <div {...stylex.props(styles.column)}>
      <AnimalPicker
        label="动物（受控）"
        items={smallAnimals.map((value) => ({ value, label: value.name }))}
        value={selectedAnimal}
        onValueChange={setSelectedAnimal}
      />
      <p {...stylex.props(styles.muted)}>已选：{selectedAnimal?.name || "无"}</p>
    </div>
  );
}
