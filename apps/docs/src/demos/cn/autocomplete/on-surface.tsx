"use client";

import { Surface } from "@lenso/ui";
import { NativeAutocomplete, styles } from "../../en/autocomplete/_native";
import { states } from "./default";
export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <NativeAutocomplete
        items={states}
        label="州"
        variant="secondary"
        fullWidth
        searchLabel="Search states"
      />
    </Surface>
  );
}
