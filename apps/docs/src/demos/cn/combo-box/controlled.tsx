// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6, Apache-2.0.
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
        items={smallAnimals}
        value={selectedAnimal}
        onValueChange={setSelectedAnimal}
      />
      <p {...stylex.props(styles.muted)}>已选：{selectedAnimal?.name || "无"}</p>
    </div>
  );
}
