"use client";
import { Surface } from "@lenso/ui";
import { AnimalForm } from "./required";
import { styles } from "./styles.stylex";
export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <AnimalForm secondary />
    </Surface>
  );
}
