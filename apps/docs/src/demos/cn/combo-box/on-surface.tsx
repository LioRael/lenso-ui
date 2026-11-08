"use client";

import { Surface } from "@lenso/ui";
import { AnimalForm } from "./required";
import { styles } from "../../en/combo-box/styles.stylex";
export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <AnimalForm secondary />
    </Surface>
  );
}
